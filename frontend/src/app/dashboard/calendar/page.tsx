'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { FeedbackModal } from '@/components/dashboard/FeedbackModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Calendar as CalendarIcon, Users, User } from 'lucide-react';

interface Session {
  id: string;
  scheduledAt: string;
  meetLink: string;
  status: string;
  mentor: {
    id: string;
    name: string;
  };
  mentee: {
    id: string;
    name: string;
  };
}

interface Feedback {
  rating: number;
  comment?: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSession, setFeedbackSession] = useState<Session | null>(null);
  const [feedbackRecipient, setFeedbackRecipient] = useState<string>('');
  const [feedbackRecipientId, setFeedbackRecipientId] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback | null>>({});
  const [viewFeedback, setViewFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length && user) {
      sessions.forEach((session) => {
        const recipientId = user.role === 'MENTOR' ? session.mentee.id : session.mentor.id;
        fetchFeedback(session.id, user.id, recipientId);
      });
    }
    // eslint-disable-next-line
  }, [sessions, user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (sessionId: string, fromUserId: string, toUserId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback?sessionId=${sessionId}&fromUserId=${fromUserId}&toUserId=${toUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: data }));
    } catch (err) {
      setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: null }));
    }
  };

  const joinSession = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  // Helper: open feedback modal for a session
  const openFeedbackModal = (session: Session) => {
    if (!user) return;
    // Determine recipient: if user is mentor, recipient is mentee, else mentor
    const recipient = user.role === 'MENTOR' ? session.mentee : session.mentor;
    setFeedbackSession(session);
    setFeedbackRecipient(recipient.name);
    setFeedbackRecipientId(recipient.id);
  };

  // Helper: submit feedback
  const submitFeedback = async (rating: number, comment: string) => {
    if (!feedbackSession || !user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          sessionId: feedbackSession.id,
          toUserId: feedbackRecipientId,
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      toast.success('Feedback submitted!');
    } catch (err) {
      toast.error('Could not submit feedback');
    }
  };

  // Quick stats for welcome bar
  const nextSession = sessions
    .filter((s) => new Date(s.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const totalSessions = sessions.length;
  const upcomingCount = sessions.filter((s) => new Date(s.scheduledAt) > new Date()).length;

  // Helper for avatar initials
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative container mx-auto py-10">
      {/* Blurred/animated background shape */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-neutral-200/60 via-neutral-100/40 to-white/0 dark:from-neutral-900/60 dark:via-neutral-800/40 dark:to-black/0 rounded-full blur-3xl opacity-60 pointer-events-none select-none z-0 animate-pulse-slow" />
      {/* Welcome & Quick Stats Bar */}
      {user?.role === 'MENTOR' && (
        <div className="relative z-10 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-2xl font-bold text-black dark:text-white shadow">
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-black dark:text-white mb-1">Welcome back, {user.name.split(' ')[0]}!</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-base">Here's your mentoring overview.</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/70 dark:bg-black/70 backdrop-blur rounded-xl px-4 py-2 shadow border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all cursor-pointer">
              <CalendarIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <span className="font-semibold text-black dark:text-white">{upcomingCount}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Upcoming</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 dark:bg-black/70 backdrop-blur rounded-xl px-4 py-2 shadow border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all cursor-pointer">
              <Users className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <span className="font-semibold text-black dark:text-white">{totalSessions}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Total</span>
            </div>
            {nextSession && (
              <div className="flex items-center gap-2 bg-white/70 dark:bg-black/70 backdrop-blur rounded-xl px-4 py-2 shadow border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all cursor-pointer">
                <CalendarIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                <span className="font-semibold text-black dark:text-white">{new Date(nextSession.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Next</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Calendar Section */}
      <div className="relative z-10 w-full bg-white/70 dark:bg-black/70 backdrop-blur rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 mb-12 transition-all">
        <div className="sticky top-0 bg-transparent z-20 pb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">Your Sessions</h1>
          {/* Add Availability button if no sessions */}
          {user?.role === 'MENTOR' && sessions.length === 0 && (
            <a href="/dashboard/availability" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black border border-neutral-300 dark:border-neutral-700 font-semibold shadow hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all">
              <User className="w-4 h-4" /> Set Availability
            </a>
          )}
        </div>
        {/* Empty state illustration if no sessions */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="w-16 h-16 text-neutral-200 dark:text-neutral-800 mb-4" />
            <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-2">No sessions yet.</p>
            <p className="text-base text-neutral-400 dark:text-neutral-500 mb-4">Set your availability to start accepting session requests!</p>
            <a href="/dashboard/availability" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black border border-neutral-300 dark:border-neutral-700 font-semibold shadow hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all">
              <User className="w-4 h-4" /> Go to Availability
            </a>
          </div>
        ) : (
          <>
            <WeeklyCalendar
              sessions={sessions}
              userRole={user?.role || 'MENTEE'}
              onLeaveFeedback={openFeedbackModal}
              feedbacks={feedbacks}
              onViewFeedback={setViewFeedback}
            />
            <FeedbackModal
              open={!!feedbackSession}
              onClose={() => setFeedbackSession(null)}
              onSubmit={submitFeedback}
              recipientName={feedbackRecipient}
            />
            {viewFeedback && (
              <Dialog open={!!viewFeedback} onOpenChange={() => setViewFeedback(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Feedback for {feedbackRecipient}</DialogTitle>
                  </DialogHeader>
                  <div className="mb-2">Rating: {viewFeedback.rating} ★</div>
                  <div>{viewFeedback.comment || <span className="text-gray-400">No comment</span>}</div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
      {/* Divider */}
      <div className="w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-12" />
    </div>
  );
} 