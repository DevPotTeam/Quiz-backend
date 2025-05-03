import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flashcard, FlashcardDocument } from './flashcard.schema';
import { AssignQuizDto, CreateFlashcardDto } from './dto/flashcards.dto';
import { UpdateFlashcardDto } from './dto/flashcards.dto';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectModel('Flashcard') private flashcardModel: Model<FlashcardDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly userService: UserService
  ) {}

  async create(dto: CreateFlashcardDto, userId: Types.ObjectId): Promise<Flashcard> {
    const flashcard = new this.flashcardModel({
      ...dto,
      topic: new Types.ObjectId(dto.topic),
      createdBy: userId, 
    });

    return flashcard.save();
  }

  async findAll(): Promise<Flashcard[]> {
  
    const flashcards = await this.flashcardModel.find().populate('topic');
    return flashcards;
  }

  async getFlashcardsGroupedByTopic() {
    return this.flashcardModel.aggregate([
      {
        $lookup: {
          from: 'maintopics', 
          localField: 'topic',
          foreignField: '_id',
          as: 'topicData',
        }
      },
      { $unwind: '$topicData' },
      {
        $group: {
          _id: '$topic',
          topic: { $first: '$topicData' },
          flashcards: { $push: '$$ROOT' },
        }
      },
      {
        $project: {
          _id: 0,
          topic: 1,
          flashcards: 1
        }
      }
    ]);
  }


  async findOne(id: string): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findById(id).populate('topic').exec();
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }
    return flashcard;
  }

  async update(id: string, dto: UpdateFlashcardDto): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findByIdAndUpdate(id, dto, {
      new: true,
    }).exec();

    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }
    return flashcard;
  }

  async delete(id: string): Promise<{ message: string }> {
    const flashcard = await this.flashcardModel.findByIdAndDelete(id).exec();
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }
    return { message: 'Flashcard deleted successfully' };
  }

  // ✅ Update Confidence Level
  async updateConfidence(id: string, confidenceLevel: 'low' | 'medium' | 'high'): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findById(id);
    if (!flashcard) throw new NotFoundException('Flashcard not found');

    flashcard.confidenceLevel = confidenceLevel;
    return flashcard.save();
  }

  // ✅ Rate a Flashcard (1-5 stars)
  async rateFlashcard(id: string, rating: number): Promise<Flashcard> {
    if (rating < 1 || rating > 5) throw new ForbiddenException('Rating must be between 1 and 5');

    const flashcard = await this.flashcardModel.findById(id);
    if (!flashcard) throw new NotFoundException('Flashcard not found');

    // Update average rating
    flashcard.rating = ((flashcard.rating * flashcard.ratingCount) + rating) / (flashcard.ratingCount + 1);
    flashcard.ratingCount += 1;

    return flashcard.save();
  }

  // ✅ Verify Flashcard (Admin Only)
  async verifyFlashcard(id: string): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findById(id);
    if (!flashcard) throw new NotFoundException('Flashcard not found');

    flashcard.verifiedByAdmin = true;
    return flashcard.save();
  }

  // ✅ Get Flashcards by Subject
  async findBySubject(subject: string): Promise<Flashcard[]> {
    return this.flashcardModel.find({ subject }).exec();
  }

  // ✅ Get Top-Rated Flashcards (4+ stars)
  async findTopRated(): Promise<Flashcard[]> {
    return this.flashcardModel.find({ rating: { $gte: 4 } }).exec();
  }


  // async submitAnswer(
  //   flashcardId: string,
  //   userId: Types.ObjectId,
  //   userAnswer: string
  // ) {
  //   const flashcard = await this.flashcardModel.findById(flashcardId);
  //   if (!flashcard) throw new NotFoundException('Flashcard not found');
  
  //   const isCorrect =
  //     flashcard.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
  
  //   // ✅ Log the attempt
  //   flashcard.attempts.push({
  //     userId: userId as Types.ObjectId,
  //     userAnswer,
  //     isCorrect,
  //     timestamp: new Date(),
  //   });
  //   await flashcard.save();
  
  //   const user = await this.userModel.findById(userId);
  //   if (user) {
  //     const flashcardObjectId = flashcard._id.toString();
  
  //     // ✅ Add flashcard to completed list if not already added
  //     const alreadyCompleted = user.flashcardsCompleted.some(
  //       (completedId) => completedId.toString() === flashcardObjectId
  //     );
  
  //     if (!alreadyCompleted) {
  //       user.flashcardsCompleted.push(flashcard._id as Types.ObjectId);
  //     }      
  
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  
  //     const performanceEntry = user.performance.find(
  //       (entry) => new Date(entry.date).getTime() === today.getTime()
  //     );
  
  //     if (performanceEntry) {
  //       performanceEntry.flashcardPerformance += 1;
  //     } else {
  //       user.performance.push({
  //         date: today,
  //         flashcardPerformance: 1,
  //         quizPerformance: 0, // if applicable
  //       });
  //     }
  
  //     // ✅ Assign badges
  //     const newBadges = await this.userService.assignBadges(userId);
  //     if (newBadges.length) {
  //       console.log('🎉 User earned new badges from flashcards:', newBadges);
  //     }
  
  //     await user.save();
  //   }
  
  //   return {
  //     correct: isCorrect,
  //     correctAnswer: flashcard.answer,
  //     userAnswer,
  //   };
  // }
  
  

  async getFlashcardAttempts(flashcardId: string) {
    const flashcard = await this.flashcardModel.findById(flashcardId).populate('attempts.userId', 'name email');
    if (!flashcard) throw new NotFoundException('Flashcard not found');

    return flashcard.attempts;
  }

  async assignQuizzesToFlashcard(flashcardId: string, dto: AssignQuizDto) {
    const flashcard = await this.flashcardModel.findById(flashcardId);
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }
  
    const existingQuizzes = new Set(flashcard.quizzes.map(q => q.toString()));
    dto.quizIds.forEach(id => existingQuizzes.add(id));
  
    flashcard.quizzes = Array.from(existingQuizzes).map(id => new Types.ObjectId(id));
    await flashcard.save();
  
    return {
      message: 'Quizzes assigned to flashcard successfully',
      flashcard,
    };
  }

  async joinFlashcard(userId: Types.ObjectId, flashcardId: string) {
    const user = await this.userModel.findById(userId);
  
    const flashcardObjectId = new Types.ObjectId(flashcardId);
  
    if (!user.flashcardsCompleted.includes(flashcardObjectId)) {
      user.flashcardsCompleted.push(flashcardObjectId);
      await user.save();
    }
  
    return { success: true, message: 'Joined flashcard' };
  }
  
  async getCreatedFlashcards(userId: Types.ObjectId) {
    return this.flashcardModel.find({ createdBy: userId });
  }
  
  
}
