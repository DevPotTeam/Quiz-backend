import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { MailerService } from 'src/helper/mailer.service';
import { UserModule } from '../user/user.module';
import { SmsService } from '../sms/sms.service';
import { HelperModule } from '../helper/helper.module';
import { BadgeSchema } from '../user/badge.schema';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { QuizSchema } from 'src/quiz/quiz.schema';
import { FlashcardSchema } from 'src/flashcards/flashcard.schema';
import { CourseSchema } from 'src/course/course.schema';
import { ResultSchema , Result} from 'src/quiz/result.schema';
import { QuizModule } from 'src/quiz/quiz.module';


@Module({ 
  imports:[MongooseModule.forFeature([
    {name:"User",schema:userSchema},
     { name: 'Quiz', schema: QuizSchema },
    { name: 'Badge', schema: BadgeSchema },
    { name: 'Flashcard', schema: FlashcardSchema },
           {name:"Course",schema:CourseSchema},
            { name: Result.name, schema: ResultSchema },
  ]),JwtModule.register({
    secret:"secretformecoceventmanagementsystem"}),
    forwardRef(() => UserModule),
    HelperModule,  
    PassportModule,

    ],
  controllers: [AuthController],
  providers: [AuthService,UserService,MailerService,SmsService,GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule {}
