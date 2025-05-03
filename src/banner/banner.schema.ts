import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })  
export class Banner {

  @Prop({ required: true, trim: true })
  imageUrl: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
