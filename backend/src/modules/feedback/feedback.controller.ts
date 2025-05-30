import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(@Body() dto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.createFeedback(dto, req.user);
  }

  @Get()
  async findOne(
    @Query('sessionId') sessionId: string,
    @Query('fromUserId') fromUserId: string,
    @Query('toUserId') toUserId: string
  ) {
    return this.feedbackService.findFeedback(sessionId, fromUserId, toUserId);
  }
} 