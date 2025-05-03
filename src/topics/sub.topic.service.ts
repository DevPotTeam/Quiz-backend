import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubTopic, SubTopicDocument } from './sub.topic.schema';
import { CreateSubTopicDto, UpdateSubTopicDto } from './dto/sub.topic.dto';

@Injectable()
export class SubTopicService {
  constructor(@InjectModel(SubTopic.name) private subTopicModel: Model<SubTopicDocument>) {}

  

  async create(createSubTopicDto: CreateSubTopicDto): Promise<SubTopic> {
    const existingSubTopic = await this.subTopicModel.findOne({ 
      name: createSubTopicDto.name.trim() 
    });
  
    if (existingSubTopic) {
      throw new BadRequestException('Subtopic already created');
    }
  
    const newSubTopic = new this.subTopicModel(createSubTopicDto);
    return newSubTopic.save();
  }
  

  async findAll(): Promise<SubTopic[]> {
    return this.subTopicModel.find().populate('mainTopic').exec();
  }

  async findById(id: string): Promise<SubTopic> {
    return this.subTopicModel.findById(id).populate('mainTopic').exec();
  }

  async update(id: string, updateSubTopicDto: UpdateSubTopicDto): Promise<SubTopic> {
    return this.subTopicModel.findByIdAndUpdate(id, updateSubTopicDto, { new: true }).exec();
  }

  async delete(id: string): Promise<SubTopic> {
    return this.subTopicModel.findByIdAndDelete(id).exec();
  }
}
