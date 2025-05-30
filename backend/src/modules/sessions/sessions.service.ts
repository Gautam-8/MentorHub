import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionRequest, SessionRequestStatus } from './entities/session-request.entity';
import { Session, SessionStatus } from './entities/session.entity';
import { CreateSessionRequestDto, UpdateSessionRequestDto } from './dto/session-request.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { Availability } from '../availability/entities/availability.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionRequest)
    private sessionRequestRepository: Repository<SessionRequest>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
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

  private generateMeetLink(): string {
    // Generate a random string for the meet link
    const randomString = Math.random().toString(36).substring(2, 12);
    return `https://meet.google.com/${randomString}`;
  }
} 