import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Performance } from './performance.schema';

@Injectable()
export class PerformanceService {
  constructor(@InjectModel('Performance') private performanceModel: Model<Performance>) {}

  async updatePerformance(userId: string, flashcardScore: number, quizScore: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.performanceModel.findOneAndUpdate(
      { userId, date: today },
      { flashcardPerformance: flashcardScore, quizPerformance: quizScore },
      { upsert: true, new: true }
    );
  }

  async getPerformanceData(userId: string, startDate: Date, endDate: Date): Promise<Performance[]> {
    return this.performanceModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
  }
}
