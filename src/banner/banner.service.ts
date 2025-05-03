import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<BannerDocument>) {}

  async createBanner(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = new this.bannerModel(createBannerDto);
    return banner.save();
  }

  async getAllBanners(): Promise<Banner[]> {
    return this.bannerModel.find().sort({ createdAt: -1 }).exec();
  }

  async getBannerById(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const updatedBanner = await this.bannerModel.findByIdAndUpdate(id, updateBannerDto, { new: true });
    if (!updatedBanner) throw new NotFoundException('Banner not found');
    return updatedBanner;
  }

  async deleteBanner(id: string): Promise<void> {
    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Banner not found');
  }
}
