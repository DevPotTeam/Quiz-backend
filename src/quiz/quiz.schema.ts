import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

export enum QuestionType {
  ShortAnswer = 'short-answer',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Dropdown = 'dropdown',
}

export enum OptionType {
  Image = 'image',
  Text = 'text',
}

export enum QuizMode {
  Flexible = 'flexible',   
  Guaranteed = 'guaranteed', 
}

export enum QuizStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

@Schema()
export class Option {
  @Prop({ enum: OptionType, required: true })
  type: OptionType; // 'text' or 'image'

  @Prop()
  value: string; 

  @Prop()
  imageUrl: string; 

  @Prop({ required: true })
  correctAnswer: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema()
export class Question {
  @Prop({ required: true })
  question: string; // Stores text question

  @Prop()
  image: string; // Stores question image URL (if applicable)

  @Prop({ enum: QuestionType, required: true })
  type: QuestionType; // 'short-answer', 'radio', etc.

  @Prop({ type: [OptionSchema], required: true })
  options: Option[];

  @Prop()
  description: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);


@Schema()
export class WinningAmount {
  @Prop({ required: true, min: 1 })
  place: number; 

  @Prop({ required: true, min: 0 })
  amount: number;
}

export const WinningAmountSchema = SchemaFactory.createForClass(WinningAmount);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop()
  banner: string;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ type: Types.ObjectId, ref: 'MainTopic', required: true })
  mainTopic: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SubTopic' }], required: false })
  subTopics: Types.ObjectId[];

  @Prop({ type: Number, min: 0 })
  price: number;

  @Prop({ enum: QuizStatus, default: QuizStatus.Draft })
  status: QuizStatus;

  @Prop({type: Number})
  totalWinningAmount: number;
  
  @Prop({ type: [WinningAmountSchema] })
  winningAmounts: WinningAmount[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  playedBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ enum: QuizMode})
  quizMode: QuizMode;
  
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
