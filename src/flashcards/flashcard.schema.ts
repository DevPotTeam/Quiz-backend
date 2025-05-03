import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlashcardDocument = Flashcard & Document;

@Schema({ timestamps: true })
export class Flashcard {

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  hint?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  masteryLevel: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop()
  subject: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'low' })
  confidenceLevel: string;

  @Prop({ default: false })
  verifiedByAdmin: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        userAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  attempts: {
    userId: Types.ObjectId;
    userAnswer: string;
    isCorrect: boolean;
    timestamp: Date;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quiz' }], default: [] })
  quizzes: Types.ObjectId[];

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  contentCompletionPercent: number;

  // 🔹 NEW: Flashcard front and back content & images
  @Prop()
  frontContent: string;

  @Prop()
  frontImage?: string;

  @Prop()
  backContent: string;

  @Prop()
  backImage?: string;

  // 🔹 NEW: Topic Reference
  @Prop({ type: Types.ObjectId, ref: 'MainTopic' })
  topic: Types.ObjectId;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);
