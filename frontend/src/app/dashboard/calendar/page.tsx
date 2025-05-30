'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

export default function CalendarPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

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

  const joinSession = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Sessions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length === 0 ? (
          <p>No scheduled sessions.</p>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>
                  Session with{' '}
                  {user?.role === 'MENTOR'
                    ? session.mentee?.name
                    : session.mentor?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Scheduled for:{' '}
                  {format(new Date(session.scheduledAt), 'PPP p')}
                </p>
                <p className="mb-4">Status: {session.status}</p>
                {session.status === 'SCHEDULED' && (
                  <Button
                    onClick={() => joinSession(session.meetLink)}
                    className="w-full"
                  >
                    Join Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 