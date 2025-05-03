import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Answer {
  @Prop({ type: Number, required: true })
  questionIndex: number; // Index of the question

  @Prop({ type: String, required: false })
  selectedTextOption?: string; // User-selected text answer (if applicable)

  @Prop({ type: String, required: false })
  selectedImageOption?: string; // User-selected image answer (if applicable)
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema()
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: string; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string; 

  @Prop({ type: [AnswerSchema], required: true })
  answers: Answer[];

  @Prop({ type: Number, required: true })
  completionTime: number; 

  @Prop({ type: Number, required: true })
  score: number; 

  @Prop({ type: Number, required: true })
  rank: number; 

  @Prop({ type: Number, required: true, default: 0 })
  correctAnswers: number;

  @Prop({ type: Number, required: true, default: 0 })
  incorrectAnswers: number; 
}

export type ResultDocument = Result & Document;
export const ResultSchema = SchemaFactory.createForClass(Result);
