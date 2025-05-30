import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('mentor/:mentorId')
  getMentorAnalytics(@Param('mentorId') mentorId: string) {
    return this.analyticsService.getMentorAnalytics(mentorId);
  }

  @Get('mentee/:menteeId')
  getMenteeAnalytics(@Param('menteeId') menteeId: string) {
    return this.analyticsService.getMenteeAnalytics(menteeId);
  }
} 