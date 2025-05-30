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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Sessions</h1>

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
    </div>
  );
} 