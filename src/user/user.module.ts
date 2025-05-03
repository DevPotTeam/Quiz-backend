import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userSchema } from './user.schema';
import { PerformanceController } from './performance.contoller';
import { PerformanceService } from './performance.service';
import { HelperModule } from '../helper/helper.module';
import { AuthModule } from '../auth/auth.module';
import { PerformanceSchema } from './performance.schema';
import { BadgeSchema } from './badge.schema';
import { Quiz, QuizSchema } from 'src/quiz/quiz.schema';
import { FlashcardSchema } from 'src/flashcards/flashcard.schema';
import { CourseSchema } from 'src/course/course.schema';
import { QuizModule } from 'src/quiz/quiz.module';
import { FlashcardsModule } from 'src/flashcards/flashcards.module';
import { CourseModule } from 'src/course/course.module';
import { ResultSchema,Result } from 'src/quiz/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'Performance', schema: PerformanceSchema },
      { name: 'Badge', schema: BadgeSchema },
       { name: 'Quiz', schema: QuizSchema },
       { name: 'Flashcard', schema: FlashcardSchema },
       {name:"Course",schema:CourseSchema},
       { name: Result.name, schema: ResultSchema },
    ]),
    HelperModule,
    forwardRef(() => AuthModule),
    forwardRef(() => QuizModule),
    FlashcardsModule,
    CourseModule
  ],
  controllers: [UserController,PerformanceController],
  providers: [UserService,PerformanceService],
  exports: [UserService],
})
export class UserModule {}
