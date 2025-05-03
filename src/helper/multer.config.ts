import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: { mimetype: string; originalname: string }) => {
    console.log("Uploading file:", file.originalname, "| Mimetype:", file.mimetype);

    let extension = file.mimetype.split('/')[1];

    if (extension === 'jpeg') extension = 'jpg';

    let resourceType: 'image' | 'video' | 'raw' = 'raw'; 
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    return {
      folder: 'courses',
      resource_type: resourceType, // Assign 'image', 'video', or 'raw'
      format: extension, // Set correct file format
      public_id: file.originalname.split('.')[0], // Remove file extension from ID
    };
  },
});

export const multerOptions = multer({ storage: cloudinaryStorage });
