import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MainTopic, MainTopicDocument } from './main.topic.schema';
import { CreateMainTopicDto, UpdateMainTopicDto } from './dto/main.dto';

@Injectable()
export class MainTopicService {
  constructor(@InjectModel(MainTopic.name) private mainTopicModel: Model<MainTopicDocument>) {}

  async create(createMainTopicDto: CreateMainTopicDto): Promise<MainTopic> {
    // Check if a main topic with the same name already exists (case-insensitive)
    const existingMainTopic = await this.mainTopicModel.findOne({
      name: { $regex: `^${createMainTopicDto.name}$`, $options: 'i' },
    });
  
    if (existingMainTopic) {
      throw new BadRequestException('Main topic already created');
    }
  
    const newTopic = new this.mainTopicModel(createMainTopicDto);
    return newTopic.save();
  }
  

  async findAll(): Promise<MainTopic[]> {
    return this.mainTopicModel.find().exec();
  }

  async findById(id: string): Promise<MainTopic> {
    return this.mainTopicModel.findById(id).exec();
  }

  async update(id: string, updateMainTopicDto: UpdateMainTopicDto): Promise<MainTopic> {
    return this.mainTopicModel.findByIdAndUpdate(id, updateMainTopicDto, { new: true }).exec();
  }

  async delete(id: string): Promise<MainTopic> {
    return this.mainTopicModel.findByIdAndDelete(id).exec();
  }
}
