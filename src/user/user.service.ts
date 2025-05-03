import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserDto, UpdatePreferencesDto } from './dto/user.dto';
import { LoginUserDto } from 'src/auth/dto/auth-dto';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { BadgeDocument } from './badge.schema';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { FlashcardDocument } from '../flashcards/flashcard.schema';
import { Course, CourseDocument } from '../course/course.schema';
import { Result, ResultDocument } from 'src/quiz/result.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Quiz') private quizModel: Model<QuizDocument>,
    @InjectModel('Badge') private readonly badgeModel: Model<BadgeDocument>,
      @InjectModel('Flashcard') private flashcardModel: Model<FlashcardDocument>,
        @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
        @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Step 1: Create the user
    const user = await this.userModel.create(createUserDto);

    await user.save();


    return user;
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  async findUserByPhoneNumber(mobileNumber: string): Promise<User> {
    return this.userModel.findOne({ mobileNumber }).exec();
  }
  
  async findUserByOtp(otp: string): Promise<User | null> {
    return this.userModel.findOne({ otp }).exec();
  }
  async findUserById(userId: Types.ObjectId): Promise<User | null> {
    return this.userModel.findById((userId)).exec();
  }  
  

  async saveResetToken(
    user: User,
    token: string,
    expirationDate: Date,
  ): Promise<void> {
    user.token = token;
    user.resetTokenExpiration = expirationDate;
    await user.save();
  }

  async updatePassword(user: User, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    user.token = null;
    user.resetTokenExpiration = null;
    await user.save();
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userModel.find()
      .populate({
        path: 'quizzesCompleted',
        select: 'title banner description startDate endDate createdAt updatedAt',
      })
      .populate({
        path: 'joinedQuizzes',
        select: 'title banner description startDate endDate createdAt updatedAt',
      })
      .populate({
        path: 'coursesEnrolled',
        select: 'title description coverImageUrl createdAt updatedAt',
      })
      .populate({
        path: 'flashcardsCompleted',
        select: 'frontImage title description',
      })
      .exec();
  
    return users.map(user => user.toObject() as User);
  }
  
  async fetchUserById(id: Types.ObjectId): Promise<User> {
    const user = await this.userModel.findById(id)
      .populate({
        path: 'quizzesCompleted',
        select: 'title banner description startDate endDate createdAt updatedAt',
      })
      .populate({
        path: 'joinedQuizzes',
        select: 'title banner description startDate endDate createdAt updatedAt',
      })
      .populate({
        path: 'coursesEnrolled',
        select: 'title description coverImageUrl createdAt updatedAt',
      })
      .populate({
        path: 'flashcardsCompleted',
        select: 'frontImage title description',
      })
      .exec();
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    return user.toObject() as User;
  }
    
  async updateUserById(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updateUserRole(userId: string, role: string): Promise<{ statusCode: number; message: string }> {
    const validRoles = ['user', 'admin', 'instructor', 'moderator'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
  
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    user.role = role;
    await user.save();
  
    return {
      statusCode: HttpStatus.OK,
      message: `User role updated to ${role} successfully`,
    };
  }

    async updateLevel(userId: string, level: string) {
      return this.userModel.findByIdAndUpdate(userId, { level }, { new: true });
    }

    async updateLearningPace(userId: string, learningPace: string) {
      return this.userModel.findByIdAndUpdate(userId, { learningPace }, { new: true });
    }

    async updateAreasOfInterest(userId: string, areasOfInterest: string[]) {
      return this.userModel.findByIdAndUpdate(userId, { areasOfInterest }, { new: true });
    }

    async updatePreferences(userId: string , updateData: UpdatePreferencesDto) {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: updateData,
        },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User preferences updated successfully',
        data: user,
      };
    }

    async getUserPreferences(userId: string) {
      return this.userModel.findById(userId).select('level learningPace areasOfInterest');
    }

    async assignBadges(userId: Types.ObjectId): Promise<string[]> {
      // Step 1: Fetch user and populate badge details
      const user = await this.userModel
        .findById(userId)
        .populate('badges'); 
    
      if (!user) return [];
    
      const earnedBadges: string[] = [];
    
      // Step 2: Fetch all available badges
      const allBadges = await this.badgeModel.find(); // Assumes badgeModel is injected
      const badgeMap = new Map(allBadges.map(b => [b.name, b]));
    
      // Helper: Get current badge names
      const userBadgeNames = user.badges.map((b: any) => b.name);
    
      // Step 3: Quiz Master badge
      if (
        user.quizzesCompleted.length >= 200 &&
        !userBadgeNames.includes('Quiz Master')
      ) {
        const badge = badgeMap.get('Quiz Master');
        if (badge) {
          user.badges.push(badge._id); // push only the ID, not full object
          earnedBadges.push('Quiz Master');
        }
      }
    
      // Step 4: Flashcard Champion badge
      const flashcardAttempts = user.performance.reduce(
        (acc, p) => acc + p.flashcardPerformance,
        0
      );
      if (
        flashcardAttempts >= 50 &&
        !userBadgeNames.includes('Flashcard Champion')
      ) {
        const badge = badgeMap.get('Flashcard Champion');
        if (badge) {
          user.badges.push(badge._id);
          earnedBadges.push('Flashcard Champion');
        }
      }
    
      // Step 5: Save user if any new badges were earned
      if (earnedBadges.length > 0) {
        // Remove duplicates just in case
        user.badges = Array.from(new Set(user.badges.map(b => b.toString()))).map(
          id => new mongoose.Types.ObjectId(id)
        );
        await user.save();
      }
    
      return earnedBadges;
    }

    async createBadge(data: { name: string; description?: string; icon?: string }) {
      const badge = new this.badgeModel(data);
      return badge.save();
    }

    async assignBadgeToUser(userId: string, badgeId: string) {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
    
      const badge = await this.badgeModel.findById(badgeId);
      if (!badge) throw new NotFoundException('Badge not found');
    
      const alreadyHasBadge = user.badges.some(id => id.toString() === badgeId);
      if (!alreadyHasBadge) {
        user.badges.push(new Types.ObjectId(badgeId)); // ✅ FIXED
        await user.save();
      }
    
      return {
        message: 'Badge assigned successfully',
        userId,
        badgeId,
      };
    }

    async getMyCreatedItems(userId: Types.ObjectId) {
      try {
        // Fetch quizzes created by the user
        const quizzes = await this.quizModel.find({ createdBy: userId }).exec();
  
        // Fetch courses created by the user (instructor)
        const courses = await this.courseModel.find({ instructor: userId }).exec();
  
        // Fetch flashcards created by the user (instructor)
        const flashcards = await this.flashcardModel.find({ createdBy: userId }).exec();
  
        return {
          quizzes,
          courses,
          flashcards,
        };
      } catch (error) {
        throw new Error('Error fetching created items');
      }
    }

    async updateBanStatus(userId: string, isBanned: boolean, reason?: string) {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
    
      user.isBanned = isBanned;
      user.banReason = isBanned ? (reason || 'No reason provided') : null;
    
      await user.save();
    
      return {
        message: isBanned ? 'User has been banned' : 'User has been unbanned',
        userId,
        isBanned,
      };
    }
    
    async getUserProgress(userId: Types.ObjectId) {
      const user = await this.userModel.findById(userId)
        .populate('quizzesCompleted')
        .populate('flashcardsCompleted')
        .populate('coursesEnrolled')
        .populate('joinedQuizzes');
    
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      // Fetch results for completed quizzes to get scores
      const results = await this.resultModel.find({
        userId: user._id,
        quizId: { $in: user.quizzesCompleted.map((quiz: any) => quiz._id) },
      });
    
      // Combine quiz info with scores
      const quizzesWithScores = user.quizzesCompleted.map((quiz: any) => {
        const result = results.find(r => r.quizId.toString() === quiz._id.toString());
        return {
          quiz,
          score: result ? result.score : null,
        };
      });
    
      return {
        quizzesCompleted: quizzesWithScores,
        flashcardsCompleted: user.flashcardsCompleted,
        coursesEnrolled: user.coursesEnrolled,
        joinedQuizzes: user.joinedQuizzes,
      };
    }
    
  
}
