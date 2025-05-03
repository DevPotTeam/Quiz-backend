import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner, BannerSchema } from './banner.schema';
import { HelperModule } from 'src/helper/helper.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),HelperModule],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService,], // Exporting for use in other modules if needed
})
export class BannerModule {}
