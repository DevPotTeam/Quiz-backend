import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubTopicDocument = SubTopic & Document;

@Schema()
export class SubTopic {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'MainTopic' , required:false})
  mainTopic: Types.ObjectId;
}

export const SubTopicSchema = SchemaFactory.createForClass(SubTopic);
