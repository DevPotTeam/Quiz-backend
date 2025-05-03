import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument, QuizStatus } from './quiz.schema';
import { Result, ResultDocument } from './result.schema';
import { CreateQuizDto, UpdateQuizDto, SubmitAnswerDto } from './dto/dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDocument } from '../user/user.schema';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @InjectModel('Quiz') private quizModel: Model<QuizDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly leaderboardService: LeaderboardService,
    private readonly userService: UserService
  ) {}

  async createQuiz(createQuizDto: CreateQuizDto, userId: Types.ObjectId): Promise<Quiz> {
    console.log("created",userId)
    try {
      const newQuiz = new this.quizModel({
        ...createQuizDto,
        createdBy: userId, 
      });
  
    
      return await newQuiz.save();
    } catch (error) {
      this.logger.error('Error creating quiz', error.stack);
      throw new BadRequestException('Failed to create quiz.');
    }
  }
  

  async getQuizById(quizId: string): Promise<Quiz> {
    try {
      return await this.quizModel.findById(quizId).exec();
    } catch (error) {
      this.logger.error('Error fetching quiz by ID', error.stack);
      throw new BadRequestException('Quiz not found.');
    }
  }
  
  async findQuizzesByMainTopic(mainTopicId: string): Promise<Quiz[]> {
    try {
      return await this.quizModel
        .find({ mainTopic: mainTopicId })
        .populate('mainTopic') // Populate mainTopic details
        .populate('subTopics') // Populate subTopics details
        .populate({
          path: 'questions', // Populate questions and nested options
          populate: {
            path: 'options',
          },
        })
        .exec();
    } catch (error) {
      this.logger.error(
        `Error fetching quizzes by main topic ID: ${mainTopicId}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch quizzes by main topic.');
    }
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      return await this.quizModel
        .find()
        .populate('mainTopic') 
        .populate('subTopics') 
        .populate({
          path: 'questions', 
          populate: {
            path: 'options',
          },
        })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching all quizzes', error.stack);
      throw new BadRequestException('Failed to fetch quizzes.');
    }
  }

  async updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    try {
      return await this.quizModel.findByIdAndUpdate(quizId, updateQuizDto, { new: true }).exec();
    } catch (error) {
      this.logger.error('Error updating quiz', error.stack);
      throw new BadRequestException('Failed to update quiz.');
    }
  }

  async deleteQuiz(quizId: string): Promise<Quiz> {
    try {
      return await this.quizModel.findByIdAndDelete(quizId).exec();
    } catch (error) {
      this.logger.error('Error deleting quiz', error.stack);
      throw new BadRequestException('Failed to delete quiz.');
    }
  }

  
  async joinQuiz(quizId: string, userId: Types.ObjectId): Promise<string> {
    // Check if the quiz exists and is published
    const quiz = await this.quizModel.findOne({ _id: quizId, status: QuizStatus.Published }).exec();
    if (!quiz) {
        throw new NotFoundException('Quiz not found or not published.');
    }

    // Check if the user already joined the quiz
    if (quiz.playedBy.includes(userId)) {
        throw new BadRequestException('User already joined the quiz.');
    }

    // Add user to the playedBy array
    quiz.playedBy.push(userId);
    await quiz.save();

    return 'User joined the quiz successfully.';
}
 
  @Cron('*/1 * * * *')
  async handleQuizStatus(): Promise<void> {
    const currentTime = new Date();
  
    try {
      // Find quizzes that should start
      const quizzesToStart = await this.quizModel.find({
        status: QuizStatus.Draft,
        startTime: { $lte: currentTime },
      });
  
      for (const quiz of quizzesToStart) {
        quiz.status = QuizStatus.Published;
        await quiz.save();
        this.logger.log(`Quiz "${quiz.title}" has started.`);
      }
  
      // Find quizzes that should end
      const quizzesToEnd = await this.quizModel.find({
        status: QuizStatus.Published,
        endTime: { $lte: currentTime },
      });
  
      for (const quiz of quizzesToEnd) {
        quiz.status = QuizStatus.Archived;
        await quiz.save();
  
        // Ensure quiz is of type QuizDocument, which includes the _id field
        await this.processQuizResults(quiz._id as string); // Cast _id to string
        this.logger.log(`Quiz "${quiz.title}" has ended.`);
      }
    } catch (error) {
      this.logger.error('Error handling quiz status', error.stack);
    }
  }
  
  async processQuizResults(quizId: string): Promise<void> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) throw new BadRequestException('Quiz not found.');

    // Mock: Fetch user responses (replace with actual logic)
    const userResponses = []; // Replace with actual responses from your database

    const userScores = userResponses.map((response) => {
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        const userAnswer = response.answers[index];
        const correctOption = question.options.find(option => option.correctAnswer);
        if (correctOption && correctOption.value === userAnswer) correctAnswers++;
      });
      return { userId: response.userId, score: correctAnswers };
    });

    const rankedUsers = userScores.sort((a, b) => b.score - a.score).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    for (const user of rankedUsers) {
      await this.resultModel.create({
        quizId,
        userId: user.userId,
        score: user.score,
        rank: user.rank,
      });
    }

    this.logger.log(`Results for quiz "${quiz.title}" have been processed.`);
  }
  
  async submitQuiz(
    quizId: string,
    userId: Types.ObjectId,
    answers: SubmitAnswerDto[],
    completionTime: number,
  ): Promise<{ message: string }> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new BadRequestException('Quiz not found.');
    }
  
    if (answers.length !== quiz.questions.length) {
      throw new BadRequestException(
        `Answer count mismatch. Expected ${quiz.questions.length}, got ${answers.length}.`,
      );
    }
  
    const formattedAnswers = answers.map((answer) => {
      if (!('questionIndex' in answer)) {
        throw new BadRequestException('Each answer must contain a questionIndex.');
      }
  
      if (!answer.selectedTextOption && !answer.selectedImageOption) {
        throw new BadRequestException(
          `Answer for questionIndex ${answer.questionIndex} must have either selectedTextOption or selectedImageOption.`,
        );
      }
  
      if (answer.selectedTextOption && answer.selectedImageOption) {
        throw new BadRequestException(
          `Answer for questionIndex ${answer.questionIndex} cannot have both selectedTextOption and selectedImageOption.`,
        );
      }
  
      return {
        questionIndex: answer.questionIndex,
        selectedTextOption: answer.selectedTextOption || null,
        selectedImageOption: answer.selectedImageOption || null,
      };
    });
  
    // 🔁 Check if result already exists
    const existingResult = await this.resultModel.findOne({ quizId, userId });
  
    if (existingResult) {
      // ✅ Overwrite old result
      existingResult.answers = formattedAnswers;
      existingResult.completionTime = completionTime;
      existingResult.score = 0;
      existingResult.rank = 0;
      existingResult.correctAnswers = 0;
      existingResult.incorrectAnswers = 0;
      await existingResult.save();
  
      this.logger.log(`🔁 Resubmission by user ${userId} for quiz ${quizId}`);
    } else {
      // 🆕 Create new result
      await this.resultModel.create({
        quizId: new Types.ObjectId(quizId),
        userId: new Types.ObjectId(userId),
        answers: formattedAnswers,
        completionTime,
        score: 0,
        rank: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
      });
  
      this.logger.log(`🆕 First-time submission by user ${userId} for quiz ${quizId}`);
    }
  
    // 🧠 Update user data
    const user = await this.userModel.findById(userId);
    if (user) {
      const quizObjectId = new Types.ObjectId(quizId);
      const alreadyCompleted = user.quizzesCompleted.some(
        (q) => q.toString() === quizObjectId.toString(),
      );
  
      if (!alreadyCompleted) {
        user.quizzesCompleted.push(quizObjectId);
      }
  
      const newBadges = await this.userService.assignBadges(user._id);
      if (newBadges.length) {
        console.log('🎉 User earned new badges:', newBadges);
      }
  
      await user.save();
    }
  
    return { message: 'Quiz submitted successfully.' };
  }
  
  async generateResults(quizId: string): Promise<any[]> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new BadRequestException('Quiz not found.');
    }
  
    // Fetch all results for the quiz
    const results = await this.resultModel.find({ quizId: new Types.ObjectId(quizId) }).exec();

  
    if (results.length === 0) {
      throw new BadRequestException('No participants found for this quiz.');
    }
  
    const scoredResults = results.map((result) => {
      let score = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
  
      result.answers.forEach((userAnswer) => {
        const question = quiz.questions[userAnswer.questionIndex];
        if (!question) return; // Skip if question index is invalid
  
        const correctOption = question.options.find((option) => option.correctAnswer);
        
        // Check if user's selected answer matches the correct answer
        if (correctOption) {
          if (userAnswer.selectedTextOption && userAnswer.selectedTextOption === correctOption.value) {
            score += 4;
            correctAnswers += 1;
          } else if (userAnswer.selectedImageOption && userAnswer.selectedImageOption === correctOption.value) {
            score += 4;
            correctAnswers += 1;
          } else {
            score -= 1;
            incorrectAnswers += 1;
          }
        }
      });
  
      return {
        ...result.toObject(),
        score,
        correctAnswers,
        incorrectAnswers,
      };
    });
  
    // Sort by score (descending), then by completion time (ascending)
    const rankedResults = scoredResults
      .sort((a, b) => {
        if (b.score === a.score) {
          return a.completionTime - b.completionTime;
        }
        return b.score - a.score;
      })
      .map((result, index) => ({
        ...result,
        rank: index + 1,
      }));
  
    // Assign prizes based on winning amounts
    const distributedResults = rankedResults.map((result) => {
      const prizeEntry = quiz.winningAmounts.find((entry) => entry.place === result.rank);
      return {
        ...result,
        prize: prizeEntry ? prizeEntry.amount : 0,
      };
    });
  
    // Update the results in the database
    for (const result of distributedResults) {
      await this.resultModel.findByIdAndUpdate(result._id, {
        score: result.score,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        rank: result.rank,
        prize: result.prize,
      });
      const userId = new Types.ObjectId(result.userId); 
      await this.leaderboardService.updateLeaderboard(userId, result.score);

    }
  
    this.logger.log(`Results and prizes for quiz "${quiz.title}" have been generated.`);
  
    return distributedResults;
  }
  
  

  @Cron(CronExpression.EVERY_MINUTE)
  async updateQuizStatuses() {
    this.logger.log('Running cron job to update quiz statuses');
    const currentTime = new Date();

    // console.log("ku", {
    //   startTime: { $gt: currentTime },
    //   status: { $ne: QuizStatus.Draft },
    // },)
    try {
      // await this.quizModel.updateMany(
      //   {
      //     startTime: { $gt: currentTime },
      //     status: { $ne: QuizStatus.Draft },
      //   },
      //   { status: QuizStatus.Draft }
      // );
      await this.quizModel.updateMany(
        {
          startTime: { $lte: currentTime },
          endTime: { $gt: currentTime },
          status: { $ne: QuizStatus.Published },
        },
        { status: QuizStatus.Published }
      );

      await this.quizModel.updateMany(
        {
          endTime: { $lte: currentTime },
          status: { $ne: QuizStatus.Archived },
        },
        { status: QuizStatus.Archived }
      );
      this.logger.log('Quiz statuses updated successfully');
    } catch (error) {
      this.logger.error('Error updating quiz statuses', error.message);
    }
  }

  async addPlayedBy(quizId: string, userId: string): Promise<Quiz> {
    // Validate if the `quizId` is valid
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Check if the userId is already in the playedBy array
    if (quiz.playedBy.includes(new Types.ObjectId(userId))) {
      throw new BadRequestException('User already added to playedBy');
    }
    quiz.playedBy.push(new Types.ObjectId(userId));
    await quiz.save();

    return quiz;
  }

  async isUserPlayedQuiz(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
  
    // Check if the userId exists in the playedBy array
    return quiz.playedBy.includes(new Types.ObjectId(userId));
  } 

  async reviewQuizAnswers(quizId: string, userId: Types.ObjectId) {

    const result = await this.resultModel.findOne({ quizId: new Types.ObjectId(quizId), userId });

    
    if (!result) {
      throw new NotFoundException('Result not found for this user');
    }
    const quiz = await this.quizModel.findById(quizId).populate('questions');
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    const feedback = quiz.questions.map((question: any, index: number) => {
      const userAnswer = result.answers.find((ans) => ans.questionIndex === index);
      
      const correctOptions = question.options
        .filter((opt) => opt.correctAnswer)
        .map((opt) => opt.value);
  
      // Check if user's answer is correct (either text or image)
      const isCorrect =
        (userAnswer?.selectedTextOption && correctOptions.includes(userAnswer.selectedTextOption)) ||
        (userAnswer?.selectedImageOption && correctOptions.includes(userAnswer.selectedImageOption));
  
      return {
        questionId: question._id,
        question: question.question,
        userAnswer: userAnswer || null,
        correctAnswer: correctOptions,
        isCorrect: Boolean(isCorrect),
        description: question.description || 'No description available',
      };
    });
  
    return {
      score: result.score,
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      feedback,
    };
  }
  
  async getUserResult(quizId: string, userId: string) {
    return await this.resultModel.findOne({ quizId, userId });
  }

  async getCreatedQuizzes(userId: Types.ObjectId) {
    return this.quizModel.find({ createdBy: userId });
  }
  
  
  
}
