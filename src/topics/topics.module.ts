import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MainTopic, MainTopicSchema } from './main.topic.schema';
import { SubTopic, SubTopicSchema } from './sub.topic.schema';
import { MainTopicService } from './main.topic.service';
import { SubTopicService } from './sub.topic.service';
import { MainTopicController } from './main.topic.controller';
import { SubTopicController } from './sub.topic.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MainTopic.name, schema: MainTopicSchema }]),
    MongooseModule.forFeature([{ name: SubTopic.name, schema: SubTopicSchema }]),
  ],
  providers: [MainTopicService, SubTopicService],
  controllers: [MainTopicController, SubTopicController],
})
export class TopicsModule {}
