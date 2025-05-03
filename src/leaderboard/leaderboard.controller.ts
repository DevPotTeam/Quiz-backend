import { Controller, Get, Req, UseGuards, HttpStatus, NotFoundException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { Types } from 'mongoose';
import { Auth, GetUserId } from 'src/guard/authguard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get the top 10 users in the leaderboard.
   */
  @Get('get')
  async getLeaderboard() {
    const leaderboard = await this.leaderboardService.getLeaderboard();
    if (!leaderboard || leaderboard.length === 0) {
      throw new NotFoundException({ statusCode: 404, message: 'No leaderboard data found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved leaderboard',
      data: leaderboard,
    };
  }

  /**
   * Get the rank & points of the logged-in user.
   */
  @Auth()
  @Get('me')
  async getMyRank(@Req() req: Request, @GetUserId() userId: Types.ObjectId) {
    const userRank = await this.leaderboardService.getUserRank(userId);
    if (!userRank) {
      throw new NotFoundException({ statusCode: 404, message: 'User rank not found' });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully retrieved user rank',
      data: userRank,
    };
  }
}
