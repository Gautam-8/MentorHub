import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMentorAnalytics(mentorId: string) {
    // Average rating
    const ratings = await this.feedbackRepository.find({
      where: { toUser: { id: mentorId } },
      select: ['rating'],
    });
    const avgRating = ratings.length ? ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length : null;
    // Total sessions
    const sessionCount = await this.sessionRepository.count({ where: { mentor: { id: mentorId } } });
    // Sessions per week (last 8 weeks)
    const sessions = await this.sessionRepository.find({
      where: { mentor: { id: mentorId } },
      select: ['scheduledAt'],
    });
    const now = new Date();
    const weeks: Record<string, number> = {};
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1 - i * 7); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
      weeks[key] = sessions.filter(s => {
        const d = new Date(s.scheduledAt);
        return d >= weekStart && d <= weekEnd;
      }).length;
    }
    return { avgRating, sessionCount, sessionsPerWeek: weeks };
  }

  async getMenteeAnalytics(menteeId: string) {
    // List of mentors
    const sessions = await this.sessionRepository.find({
      where: { mentee: { id: menteeId } },
      relations: ['mentor'],
    });
    const mentorMap: Record<string, { name: string; sessionCount: number; avgRating: number | null }> = {};
    for (const session of sessions) {
      const mentor = session.mentor;
      if (!mentor) continue;
      if (!mentorMap[mentor.id]) {
        // Get all feedback for this mentor
        const feedbacks = await this.feedbackRepository.find({ where: { toUser: { id: mentor.id } } });
        const avgRating = feedbacks.length ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : null;
        mentorMap[mentor.id] = {
          name: mentor.name,
          sessionCount: 1,
          avgRating,
        };
      } else {
        mentorMap[mentor.id].sessionCount++;
      }
    }
    return { mentors: Object.values(mentorMap) };
  }
}

function getWeekNumber(date: Date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
} 