import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File, folder: string, resourceType: 'image' | 'video' | 'auto' = 'auto'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('File is undefined'));
        return;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },  
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url); 
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }
}
