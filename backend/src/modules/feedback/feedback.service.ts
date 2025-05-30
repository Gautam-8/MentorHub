import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { User } from '../users/entities/user.entity';
import { Session, SessionStatus } from '../sessions/entities/session.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createFeedback(dto: CreateFeedbackDto, fromUser: User) {
    // Check session exists and is completed or ended
    const session = await this.sessionRepository.findOne({
      where: { id: dto.sessionId },
      relations: ['mentor', 'mentee'],
    });
    if (!session) throw new BadRequestException('Session not found');
    if (session.status !== SessionStatus.COMPLETED && session.status !== SessionStatus.SCHEDULED) {
      throw new ForbiddenException('Feedback can only be left after session ends');
    }
    // Prevent duplicate feedback
    const existing = await this.feedbackRepository.findOne({
      where: {
        session: { id: dto.sessionId },
        fromUser: { id: fromUser.id },
        toUser: { id: dto.toUserId },
      },
    });
    if (existing) throw new BadRequestException('Feedback already submitted for this session');
    // Check toUser exists
    const toUser = await this.userRepository.findOne({ where: { id: dto.toUserId } });
    if (!toUser) throw new BadRequestException('Recipient user not found');
    // Create feedback
    const feedback = this.feedbackRepository.create({
      session,
      fromUser,
      toUser,
      rating: dto.rating,
      comment: dto.comment,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findFeedback(sessionId: string, fromUserId: string, toUserId: string) {
    return this.feedbackRepository.findOne({
      where: {
        session: { id: sessionId },
        fromUser: { id: fromUserId },
        toUser: { id: toUserId },
      },
    });
  }
} 