// badge.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Badge {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: null })
  icon: string; 
}

export type BadgeDocument = HydratedDocument<Badge>;
export const BadgeSchema = SchemaFactory.createForClass(Badge);
