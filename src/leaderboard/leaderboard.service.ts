import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResultDocument } from '../quiz/result.schema';
import { User } from '../user/user.schema';
import { LeaderboardEntry } from './leaderboard.schema';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel('Result') private resultModel: Model<ResultDocument>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Leaderboard') private leaderboardModel: Model<LeaderboardEntry>,
  ) {}
  
  async getLeaderboard() {
    const leaderboard = await this.resultModel.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalQuizzesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $addFields: {
          quizzesCompletedIds: '$user.quizzesCompleted',
          flashcardsCompletedIds: '$user.flashcardsCompleted',
          coursesEnrolledIds: '$user.coursesEnrolled',
          joinedQuizzesIds: '$user.joinedQuizzes',
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizzesCompletedIds',
          foreignField: '_id',
          as: 'quizzesCompletedDocs',
          pipeline: [
            { $project: { title: 1, status: 1, banner: 1, createdAt:1, updatedAt:1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: 'flashcardsCompletedIds',
          foreignField: '_id',
          as: 'flashcardsCompletedDocs',
          pipeline: [
            { $project: { title: 1, description: 1,imageUrl: 1, createdAt:1, updatedAt:1 } } 
          ]
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'coursesEnrolledIds',
          foreignField: '_id',
          as: 'coursesEnrolledDocs',
          pipeline: [
            { $project: { title: 1, description: 1, coverImageUrl: 1, createdAt:1, updatedAt:1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'joinedQuizzesIds',
          foreignField: '_id',
          as: 'joinedQuizzesDocs',
          pipeline: [
            { $project: { title: 1, banner: 1, status: 1, createdAt:1, updatedAt:1 } }
          ]
        }
      },
      {
        $addFields: {
          'user.quizzesCompleted': '$quizzesCompletedDocs',
          'user.flashcardsCompleted': '$flashcardsCompletedDocs',
          'user.coursesEnrolled': '$coursesEnrolledDocs',
          'user.joinedQuizzes': '$joinedQuizzesDocs',
        },
      },
      {
        $project: {
          userId: '$user',
          totalScore: 1,
          totalQuizzesPlayed: 1,
        },
      },
    ]);
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  
    return leaderboardWithRank;
  }

  async getUserRank(userId: Types.ObjectId) {
    const userLeaderboardEntry = await this.leaderboardModel
      .findOne({ userId }, { rank: 1, totalScore: 1, totalQuizzesPlayed: 1 })
      .populate({
        path: 'userId',
        select: 'name email profileImage profilePic quizzesCompleted flashcardsCompleted coursesEnrolled joinedQuizzes',
        populate: [
          {
            path: 'quizzesCompleted',
            model: 'Quiz',
            select: 'title status banner createdAt updatedAt',
          },
          {
            path: 'flashcardsCompleted',
            model: 'Flashcard',
            select: 'title description imageUrl createdAt updatedAt',
          },
          {
            path: 'coursesEnrolled',
            model: 'Course',
            select: 'title description coverImageUrl createdAt updatedAt',
          },
          {
            path: 'joinedQuizzes',
            model: 'Quiz',
            select: 'title banner status createdAt updatedAt',
          },
        ],
      });
  
    if (!userLeaderboardEntry) {
      // Agar leaderboard me nahi mila to directly User ki details le aao
      const user = await this.userModel.findById(userId).select('name email profileImage profilePic quizzesCompleted flashcardsCompleted coursesEnrolled joinedQuizzes').populate([
        { path: 'quizzesCompleted', model: 'Quiz', select: 'title status banner createdAt updatedAt' },
        { path: 'flashcardsCompleted', model: 'Flashcard', select: 'title description imageUrl createdAt updatedAt' },
        { path: 'coursesEnrolled', model: 'Course', select: 'title description coverImageUrl createdAt updatedAt' },
        { path: 'joinedQuizzes', model: 'Quiz', select: 'title banner status createdAt updatedAt' },
      ]);
  
      if (!user) {
        throw new BadRequestException('User not found');
      }
  
      return {
        user: user,
        rank: 0,
        totalScore: 0,
        totalQuizzesPlayed: 0,
      };
    }
  
    // Agar leaderboard entry mila
    return {
      user: userLeaderboardEntry.userId,
      rank: userLeaderboardEntry.rank,
      totalScore: userLeaderboardEntry.totalScore,
      totalQuizzesPlayed: userLeaderboardEntry.totalQuizzesPlayed,
    };
  }
  
  async updateLeaderboard(userId: Types.ObjectId, quizScore: number) {
    let leaderboardEntry = await this.leaderboardModel.findOne({ userId });
  
    if (!leaderboardEntry) {
      leaderboardEntry = new this.leaderboardModel({
        userId,
        totalScore: quizScore,
        totalQuizzesPlayed: 1,
        rank: 0, 
      });
    } else {
      leaderboardEntry.totalScore += quizScore;
      leaderboardEntry.totalQuizzesPlayed += 1;
    }
  
    await leaderboardEntry.save();
    await this.recalculateRanks();
  }
  
  async recalculateRanks() {
    const leaderboardEntries = await this.leaderboardModel.find().sort({ totalScore: -1 });
  
    leaderboardEntries.forEach(async (entry, index) => {
      entry.rank = index + 1;
      await entry.save();
    });
  }
  
}
