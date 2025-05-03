import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MainTopicService } from './main.topic.service';
import { CreateMainTopicDto, UpdateMainTopicDto } from './dto/main.dto';
import { MainTopic } from './main.topic.schema';

@ApiTags('Main Topics')
@Controller('main-topics')
export class MainTopicController {
  constructor(private readonly mainTopicService: MainTopicService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new main topic' })
  @ApiBody({ type: CreateMainTopicDto })
  @ApiResponse({ status: 201, description: 'The main topic has been successfully created.', type: MainTopic })
  @ApiResponse({ status: 400, description: 'Invalid data input.' })
  async create(@Body() createMainTopicDto: CreateMainTopicDto): Promise<MainTopic> {
    return this.mainTopicService.create(createMainTopicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of all main topics' })
  @ApiResponse({ status: 200, description: 'List of all main topics', type: [MainTopic] })
  async findAll(): Promise<{ status: number; message: string; data: MainTopic[] }> {
    const topics = await this.mainTopicService.findAll();
    return {
      status : HttpStatus.OK,
      message: "Fetched main topics successfully",
      data: topics
    };
  }
  

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a main topic by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the main topic to retrieve', example: '605c72b1f6d2c2a5b8b8e9b0' })
  @ApiResponse({ status: 200, description: 'The main topic with the specified ID', type: MainTopic })
  @ApiResponse({ status: 404, description: 'Main topic not found.' })
  async findById(@Param('id') id: string): Promise<MainTopic> {
    return this.mainTopicService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing main topic' })
  @ApiParam({ name: 'id', description: 'The ID of the main topic to update', example: '605c72b1f6d2c2a5b8b8e9b0' })
  @ApiBody({ type: UpdateMainTopicDto })
  @ApiResponse({ status: 200, description: 'The updated main topic', type: MainTopic })
  @ApiResponse({ status: 404, description: 'Main topic not found.' })
  async update(@Param('id') id: string, @Body() updateMainTopicDto: UpdateMainTopicDto): Promise<MainTopic> {
    return this.mainTopicService.update(id, updateMainTopicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a main topic by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the main topic to delete', example: '605c72b1f6d2c2a5b8b8e9b0' })
  @ApiResponse({ status: 200, description: 'The deleted main topic', type: MainTopic })
  @ApiResponse({ status: 404, description: 'Main topic not found.' })
  async delete(@Param('id') id: string): Promise<MainTopic> {
    return this.mainTopicService.delete(id);
  }
}
