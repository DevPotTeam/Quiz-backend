import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Quiz, QuizSchema } from './quiz.schema';
import { HelperModule } from 'src/helper/helper.module';
import { MainTopicSchema } from 'src/topics/main.topic.schema';
import { SubTopicSchema } from 'src/topics/sub.topic.schema';
import { Result, ResultSchema } from './result.schema';
import { UserModule } from '../user/user.module';
import { userSchema } from '../user/user.schema';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), 
    MongooseModule.forFeature([
      { name: 'Quiz', schema: QuizSchema },
      { name: Result.name, schema: ResultSchema },
      { name: 'MainTopic', schema: MainTopicSchema },
      { name: 'SubTopic', schema: SubTopicSchema },
      { name: 'User', schema: userSchema },
    ]),
    HelperModule,
    forwardRef(() => UserModule),
    AuthModule,
    LeaderboardModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService,MongooseModule],
})
export class QuizModule {}
