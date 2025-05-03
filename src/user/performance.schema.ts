import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Performance extends Document {
  @Prop({ required: true })  
  userId: string; // User reference

  @Prop({ required: true })
  date: Date; // Date of the performance record

  @Prop({ default: 0 })
  flashcardPerformance: number; // Performance in percentage

  @Prop({ default: 0 })
  quizPerformance: number; // Performance in percentage
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);
