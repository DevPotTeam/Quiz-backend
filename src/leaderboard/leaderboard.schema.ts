import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class LeaderboardEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  totalScore: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalQuizzesPlayed: number;

  @Prop({ type: Number, required: true, default: 0 })
  rank: number;
}

export type LeaderboardEntryDocument = HydratedDocument<LeaderboardEntry>;
export const LeaderboardEntrySchema = SchemaFactory.createForClass(LeaderboardEntry);
