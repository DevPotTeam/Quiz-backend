import { Controller, Get, Query, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get(':userId')
  async getPerformance(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.performanceService.getPerformanceData(userId, new Date(startDate), new Date(endDate));
  }
}
