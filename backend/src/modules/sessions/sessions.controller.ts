import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionRequestDto, UpdateSessionRequestDto } from './dto/session-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  createRequest(@Body() createSessionRequestDto: CreateSessionRequestDto, @Request() req) {
    return this.sessionsService.createRequest(createSessionRequestDto, req.user);
  }

  @Get('requests/all')
  async findAllRequestsAll() {
    return this.sessionsService.findAllRequestsAll();
  }

  @Get('requests')
  findAllRequests(@Request() req) {
    return this.sessionsService.findAllRequests(req.user);
  }

  @Get('requests/:id')
  findOneRequest(@Param('id') id: string, @Request() req) {
    return this.sessionsService.findOneRequest(id, req.user);
  }

  @Patch('requests/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  updateRequest(
    @Param('id') id: string,
    @Body() updateSessionRequestDto: UpdateSessionRequestDto,
    @Request() req,
  ) {
    return this.sessionsService.updateRequest(id, updateSessionRequestDto, req.user);
  }

  @Get('request/:requestId')
  findSessionByRequest(@Param('requestId') requestId: string, @Request() req) {
    return this.sessionsService.findSessionByRequest(requestId, req.user);
  }

  @Get('analytics/mentor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  getMentorAnalytics(@Request() req) {
    return this.sessionsService.getMentorAnalytics(req.user);
  }

  @Get('analytics/mentee')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTEE)
  getMenteeAnalytics(@Request() req) {
    return this.sessionsService.getMenteeAnalytics(req.user);
  }

  @Get()
  findAllSessions(@Request() req) {
    return this.sessionsService.findAllSessions(req.user);
  }

  @Get(':id')
  findOneSession(@Param('id') id: string, @Request() req) {
    return this.sessionsService.findOneSession(id, req.user);
  }
} 