import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isAfter, isBefore } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import { Button } from '@/components/ui/button';

const timeZones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
  Intl.DateTimeFormat().resolvedOptions().timeZone,
];

interface Session {
  id: string;
  scheduledAt: string;
  meetLink: string;
  status: string;
  mentor: { id: string; name: string };
  mentee: { id: string; name: string };
}

interface WeeklyCalendarProps {
  sessions: Session[];
  userRole: 'MENTOR' | 'MENTEE';
  onLeaveFeedback?: (session: Session) => void;
  feedbacks?: Record<string, { rating: number; comment?: string } | null>;
  onViewFeedback?: (feedback: { rating: number; comment?: string }) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ sessions, userRole, onLeaveFeedback, feedbacks, onViewFeedback }) => {
  // Timezone state
  const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timezone, setTimezone] = useState(defaultTz);

  // Get the start of the current week (Monday)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Show all scheduled sessions, regardless of date
  const filteredSessions = sessions.filter(
    (session) => session.status === 'SCHEDULED'
  );

  // Debug logs
  console.log('All sessions:', sessions);
  console.log('Filtered sessions:', filteredSessions);
  console.log('Current timezone:', timezone);
  console.log('Now:', new Date().toISOString());
  sessions.forEach(session => {
    console.log('Session scheduledAt:', session.scheduledAt, 'Parsed:', parseISO(session.scheduledAt).toISOString());
  });

  // Group sessions by day (in selected timezone)
  const sessionsByDay = days.map(day =>
    filteredSessions.filter(session => {
      const zonedDate = toZonedTime(parseISO(session.scheduledAt), timezone);
      return isSameDay(zonedDate, toZonedTime(day, timezone));
    })
  );

  return (
    <div>
      <div className="flex items-center mb-4 gap-2">
        <span className="font-medium">Timezone:</span>
        <select
          className="border rounded px-2 py-1"
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
        >
          {Array.from(new Set(timeZones)).map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, idx) => (
          <div key={idx} className="text-center font-semibold">
            {format(day, 'EEE dd/MM')}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 min-h-[200px]">
        {sessionsByDay.map((sessions, dayIdx) => (
          <div key={dayIdx} className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-gray-400 text-sm text-center">No sessions</div>
            ) : (
              sessions.map(session => {
                const zonedDate = toZonedTime(parseISO(session.scheduledAt), timezone);
                const isPast = isBefore(zonedDate, new Date());
                const recipientId = userRole === 'MENTOR' ? session.mentee.id : session.mentor.id;
                const feedback = feedbacks?.[`${session.id}_${recipientId}`];
                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded shadow p-2 flex flex-col items-center ${isPast ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="font-medium">
                      {tzFormat(zonedDate, 'p', { timeZone: timezone })}
                    </div>
                    <div className="text-sm mb-1">
                      {userRole === 'MENTOR' ? session.mentee.name : session.mentor.name}
                    </div>
                    <div className="text-xs mb-1">Status: {session.status}</div>
                    {session.status === 'SCHEDULED' && !isPast && (
                      <Button size="sm" onClick={() => window.open(session.meetLink, '_blank')}>
                        Join Session
                      </Button>
                    )}
                    {session.status === 'SCHEDULED' && isPast && feedback && onViewFeedback && (
                      <Button size="sm" variant="outline" onClick={() => onViewFeedback(feedback)}>
                        View Feedback
                      </Button>
                    )}
                    {session.status === 'SCHEDULED' && isPast && !feedback && onLeaveFeedback && (
                      <Button size="sm" variant="outline" onClick={() => onLeaveFeedback(session)}>
                        Leave Feedback
                      </Button>
                    )}
                    {session.status === 'SCHEDULED' && isPast && !onLeaveFeedback && !feedback && (
                      <span className="text-xs text-gray-400">Session Ended</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 