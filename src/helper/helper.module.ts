import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
// import { RedisService } from './redis.service';
import { MailerService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { SirvService } from './sirv.service';

@Module({
  imports: [ConfigModule],
  providers: [
    HelperService,
    // RedisService,
    MailerService,
    CloudinaryService,
    SirvService,
    ...[CloudinaryProvider], 
  ],
  exports: [HelperService, MailerService, CloudinaryService,SirvService],
})
export class HelperModule {}
