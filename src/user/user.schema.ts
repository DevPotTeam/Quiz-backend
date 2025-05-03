import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema()
export class UserDocument {
  @Prop()
  name: string;

  @Prop()
  dob: Date;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, default: null })
  googleId?: string;
  
  @Prop({ type: String, default: null })
  authProvider?: 'google' | 'local';
  
  
  @Prop({ required: false })
  password?: string; // make password optional for Google users
  
  @Prop()
  token: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  resetTokenExpiration: Date;

  @Prop()
  otp: string;

  @Prop()
  address: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], default: [] })
  quizzesCompleted: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' }], default: [] })
  flashcardsCompleted: Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], default: [] })
  coursesEnrolled: mongoose.Types.ObjectId[];

  @Prop({type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], default: []}) 
  joinedQuizzes: mongoose.Types.ObjectId[]; 

  @Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' })
  level: string;

  @Prop({ 
    enum: ['Relaxed', 'Regular', 'Intensive'], 
    default: 'Regular' 
  })
  learningPace: string;

  @Prop({ type: [String], default: [] }) 
  areasOfInterest: string[];

  @Prop({ enum: ['user', 'admin', 'instructor', 'moderator'], default: 'user' })
  role: string;

  @Prop({ type: String, default: null }) 
  profilePic: string;

  @Prop({ 
    type: [{ date: Date, flashcardPerformance: Number, quizPerformance: Number }], 
    default: [] 
  })
  performance: { date: Date; flashcardPerformance: number; quizPerformance: number }[];

  @Prop({ 
    type: [{ date: Date, activityCount: Number }], 
    default: [] 
  })
  activityTracker: { date: Date; activityCount: number }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }], default: [] })
   badges: Types.ObjectId[];

   @Prop({ default: false })
    isBanned: boolean;

    @Prop({ type: String, default: null })
    banReason?: string;


}

export type User = HydratedDocument<UserDocument>;

export const userSchema = SchemaFactory.createForClass(UserDocument);

