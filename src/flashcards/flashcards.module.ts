import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashcardsService } from './flashcards.service';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardSchema } from './flashcard.schema';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { userSchema } from '../user/user.schema';
import { QuizModule } from 'src/quiz/quiz.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Flashcard', schema: FlashcardSchema },{ name: 'User', schema: userSchema }]),AuthModule,  forwardRef(() => UserModule), // ✅ Use forwardRef if circular dependency
  forwardRef(() => QuizModule),],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}
