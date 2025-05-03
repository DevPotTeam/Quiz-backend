import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MainTopicDocument = MainTopic & Document;

@Schema()
export class MainTopic {
  @Prop({ required: true, unique: true })
  name: string;
}

export const MainTopicSchema = SchemaFactory.createForClass(MainTopic);
