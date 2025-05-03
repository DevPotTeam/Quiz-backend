import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BannerService } from './banner.service';
import { Banner } from './banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../helper/cloudinary.service';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Banner')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a banner image' }) 
    @ApiConsumes('multipart/form-data') 
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }) 
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new Error('No file uploaded');
      }
      return this.cloudinaryService.uploadFile(file, 'banner', 'image');
    }
  

    @Post()
    @ApiOperation({ summary: 'Create a new banner' }) // API ka description
    @ApiBody({ type: CreateBannerDto }) // Swagger me DTO ka schema show hoga
    async createBanner(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
      console.log("Received data:", createBannerDto);
      return this.bannerService.createBanner(createBannerDto);
    }
  

    @Get()
    @ApiOperation({ summary: 'Get all banners' }) 
    @ApiOkResponse({
      description: 'List of all banners',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65f9c7f2e6d5f5a2b4a7c9e3' },
                imageUrl: { type: 'string', example: 'https://example.com/banner.jpg' },
                status: { type: 'string', example: 'active' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    })
    async getAllBanners(): Promise<{ success: boolean; data: Banner[] }> {
      const banners = await this.bannerService.getAllBanners();
      return { success: true, data: banners };
    }
    

  @Get(':id')
  async getBannerById(@Param('id') id: string): Promise<Banner> {
    return this.bannerService.getBannerById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update banner details' }) 
  @ApiBody({ type: UpdateBannerDto }) 
  async updateBanner(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto): Promise<Banner> {
    return this.bannerService.updateBanner(id, updateBannerDto);
  }
  

  @Delete(':id')
  async deleteBanner(@Param('id') id: string): Promise<void> {
    return this.bannerService.deleteBanner(id);
  }
}
  