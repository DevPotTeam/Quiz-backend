import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

export type LessonDocument = Lesson & Document;

export enum ContentType {
  Video = 'video',
  Article = 'article',
  Quiz = 'quiz',
}

@Schema()
export class LessonProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] }) // Lesson IDs or indexes
  completedLessons: Types.ObjectId[];
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);


@Schema()
export class Content {
  @Prop({ enum: ContentType, required: true })
  type: ContentType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

@Schema()
export class Lesson {
  @Prop({ required: true })
  lessonTitle: string;

  @Prop({ type: [ContentSchema], required: true })
  contents: Content[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema()
export class Feedback {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) 
  userId: Types.ObjectId;

  @Prop({ required: true })
  feedbackText: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [LessonSchema] })
  lessons: Lesson[];

  @Prop({ type: [LessonProgressSchema], default: [] })
  lessonProgress: LessonProgress[];


  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  instructor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  enrolledStudents: Types.ObjectId[];

  @Prop({ required: true, enum: CourseStatus, default: CourseStatus.Draft })
  status: CourseStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ default: null })
  publishedAt?: Date;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: [String], default: [] })
  prerequisites: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ type: [FeedbackSchema], default: [] })
  feedbacks: Feedback[];

  @Prop({ default: true })
  isFree: boolean;

  @Prop({ default: 0 })
  price?: number;

  @Prop({ default: null })
  estimatedDuration?: number;

  @Prop({ default: null })
  coverImageUrl?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' }) 
  createdBy: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
