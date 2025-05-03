// sirv.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SirvService } from './sirv.service';

@Controller('sirv')
export class SirvController {
  constructor(private readonly sirvService: SirvService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const localPath = file.path; // local path where multer stores the file
    const remotePath = `uploads/${file.originalname}`; // Sirv storage path

    const url = await this.sirvService.uploadFile(localPath, remotePath);

    return { url };
  }
}
