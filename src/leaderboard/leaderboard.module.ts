import { forwardRef, Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from '../user/user.schema';
import { ResultSchema } from '../quiz/result.schema';
import { HelperModule } from '../helper/helper.module';
import { AuthModule } from '../auth/auth.module';
import {LeaderboardEntrySchema } from './leaderboard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'Result', schema: ResultSchema },
      { name: 'Leaderboard', schema: LeaderboardEntrySchema },
    ]),
    HelperModule,
    AuthModule,
  ],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
