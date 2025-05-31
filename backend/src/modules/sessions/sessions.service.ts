import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionRequest, SessionRequestStatus } from './entities/session-request.entity';
import { Session, SessionStatus } from './entities/session.entity';
import { CreateSessionRequestDto, UpdateSessionRequestDto } from './dto/session-request.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { Availability } from '../availability/entities/availability.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { In } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionRequest)
    private sessionRequestRepository: Repository<SessionRequest>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async createRequest(createSessionRequestDto: CreateSessionRequestDto, mentee: User) {
    if (mentee.role !== UserRole.MENTEE) {
      throw new ForbiddenException('Only mentees can create session requests');
    }

    const availability = await this.availabilityRepository.findOne({
      where: { id: createSessionRequestDto.availabilityId },
      relations: ['mentor'],
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    // Check if there's already a pending request for this slot
    const existingRequest = await this.sessionRequestRepository.findOne({
      where: {
        availability: { id: availability.id },
        status: SessionRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ForbiddenException('This slot already has a pending request');
    }

    const sessionRequest = this.sessionRequestRepository.create({
      mentee,
      mentor: availability.mentor,
      availability,
      note: createSessionRequestDto.note,
    });

    return this.sessionRequestRepository.save(sessionRequest);
  }

  async findAllRequests(user: User) {
    if (user.role === UserRole.MENTOR) {
      return this.sessionRequestRepository.find({
        where: { mentor: { id: user.id } },
        relations: ['mentee', 'availability'],
        order: { createdAt: 'DESC' },
      });
    } else {
      return this.sessionRequestRepository.find({
        where: { mentee: { id: user.id } },
        relations: ['mentor', 'availability'],
        order: { createdAt: 'DESC' },
      });
    }
  }

  async findOneRequest(id: string, user: User) {
    const request = await this.sessionRequestRepository.findOne({
      where: { id },
      relations: ['mentee', 'mentor', 'availability'],
    });

    if (!request) {
      throw new NotFoundException('Session request not found');
    }

    if (request.mentee.id !== user.id && request.mentor.id !== user.id) {
      throw new ForbiddenException('You can only view your own session requests');
    }

    return request;
  }

  async updateRequest(id: string, updateSessionRequestDto: UpdateSessionRequestDto, user: User) {
    const request = await this.findOneRequest(id, user);

    if (user.role !== UserRole.MENTOR) {
      throw new ForbiddenException('Only mentors can update session requests');
    }

    if (request.mentor.id !== user.id) {
      throw new ForbiddenException('You can only update requests for your availability slots');
    }

    if (request.status !== SessionRequestStatus.PENDING) {
      throw new BadRequestException('Can only update pending requests');
    }

    request.status = updateSessionRequestDto.status as SessionRequestStatus;

    if (request.status === SessionRequestStatus.APPROVED) {
      // Create a session when the request is approved
      const session = this.sessionRepository.create({
        mentor: request.mentor,
        mentee: request.mentee,
        sessionRequest: request,
        scheduledAt: new Date(),
        meetLink: this.generateMeetLink(),
      });

      await this.sessionRepository.save(session);
    }

    return this.sessionRequestRepository.save(request);
  }

  async findAllSessions(user: User) {
    if (user.role === UserRole.MENTOR) {
      return this.sessionRepository.find({
        where: { mentor: { id: user.id } },
        relations: ['mentor', 'mentee', 'sessionRequest'],
        order: { scheduledAt: 'DESC' },
      });
    } else {
      return this.sessionRepository.find({
        where: { mentee: { id: user.id } },
        relations: ['mentor', 'mentee', 'sessionRequest'],
        order: { scheduledAt: 'DESC' },
      });
    }
  }

  async findOneSession(id: string, user: User) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['mentor', 'mentee', 'sessionRequest'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.mentor.id !== user.id && session.mentee.id !== user.id) {
      throw new ForbiddenException('You can only view your own sessions');
    }

    return session;
  }

  async findSessionByRequest(requestId: string, user: User) {
    const session = await this.sessionRepository.findOne({
      where: { sessionRequest: { id: requestId } },
      relations: ['mentor', 'mentee', 'sessionRequest'],
    });

    if (!session) {
      throw new NotFoundException('Session not found for this request');
    }

    if (session.mentor.id !== user.id && session.mentee.id !== user.id) {
      throw new ForbiddenException('You can only view your own sessions');
    }

    return session;
  }

  private generateMeetLink(): string {
    // Generate a random string for the meet link
    const randomString = Math.random().toString(36).substring(2, 12);
    return `https://meet.google.com/${randomString}`;
  }

  async getMentorAnalytics(user: User) {
    // Get all sessions for this mentor
    const sessions = await this.sessionRepository.find({
      where: { mentor: { id: user.id } },
      relations: ['mentee'],
      order: { scheduledAt: 'DESC' },
    });

    // Get feedback for these sessions
    const feedback = await this.feedbackRepository.find({
      where: { session: { id: In(sessions.map(s => s.id)) } },
    });

    // Calculate average rating
    const ratings = feedback.map(f => f.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    // Get sessions per week for the last 8 weeks
    const sessionsPerWeek = Array(8).fill(0);
    const now = new Date();
    sessions.forEach(session => {
      const sessionDate = new Date(session.scheduledAt);
      const weeksAgo = Math.floor((now.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo < 8) {
        sessionsPerWeek[weeksAgo]++;
      }
    });

    return {
      totalSessions: sessions.length,
      averageRating: Number(averageRating.toFixed(1)),
      sessionsPerWeek: sessionsPerWeek.reverse(), // Most recent week first
      totalMentees: new Set(sessions.map(s => s.mentee.id)).size,
    };
  }

  async getMenteeAnalytics(user: User) {
    // Get all sessions for this mentee
    const sessions = await this.sessionRepository.find({
      where: { mentee: { id: user.id } },
      relations: ['mentor'],
      order: { scheduledAt: 'DESC' },
    });

    // Get feedback for these sessions
    const feedback = await this.feedbackRepository.find({
      where: { session: { id: In(sessions.map(s => s.id)) } },
    });

    // Get unique mentors with their stats
    const mentorStats = new Map();
    sessions.forEach(session => {
      const mentorId = session.mentor.id;
      if (!mentorStats.has(mentorId)) {
        mentorStats.set(mentorId, {
          mentor: session.mentor,
          sessions: 0,
          ratings: [],
        });
      }
      const stats = mentorStats.get(mentorId);
      stats.sessions++;
      
      // Find feedback for this session
      const sessionFeedback = feedback.find(f => f?.session?.id === session.id);
      if (sessionFeedback?.rating) {
        stats.ratings.push(sessionFeedback.rating);
      }
    });

    // Calculate average ratings for each mentor
    const mentors = Array.from(mentorStats.values()).map(stats => ({
      ...stats.mentor,
      sessions: stats.sessions,
      averageRating: stats.ratings.length > 0
        ? Number((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1))
        : 0,
    }));

    return {
      totalSessions: sessions.length,
      mentors,
    };
  }
} 