import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads', // Folder where files are temporarily saved
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
};
