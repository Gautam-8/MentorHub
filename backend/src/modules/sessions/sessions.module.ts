import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionRequest } from './entities/session-request.entity';
import { Session } from './entities/session.entity';
import { Availability } from '../availability/entities/availability.entity';
import { FeedbackModule } from '../feedback/feedback.module';
import { Feedback } from '../feedback/entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionRequest, Session, Availability, Feedback]),
    FeedbackModule
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {} 