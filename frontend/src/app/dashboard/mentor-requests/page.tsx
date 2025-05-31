'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SessionRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  note?: string;
  mentee: {
    id: string;
    name: string;
  };
  availability: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  createdAt: string;
}

export default function MentorRequestsPage() {
  const { user } = useAuth();
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionRequests();
  }, []);

  const fetchSessionRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch session requests');
      const data = await response.json();
      setSessionRequests(data);
    } catch (error) {
      toast.error('Failed to load session requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (requestId: string, status: 'APPROVED' | 'DECLINED') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update session request');

      toast.success(`Session request ${status.toLowerCase()} successfully`);
      fetchSessionRequests();
    } catch (error) {
      toast.error('Failed to update session request');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Session Requests</h1>

      {sessionRequests.length === 0 ? (
        <p>No pending session requests.</p>
      ) : (
        <div className="space-y-4">
          {sessionRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>
                  Request from {request.mentee.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  {request.availability.dayOfWeek} at {request.availability.startTime} - {request.availability.endTime}
                </p>
                <p className="mb-2">Status: {request.status}</p>
                {request.note && <p className="text-sm text-gray-500 mb-2">{request.note}</p>}
                <p className="text-sm text-gray-500 mb-4">
                  Requested on {format(new Date(request.createdAt), 'PPP')}
                </p>
                {request.status === 'PENDING' && (
                  <div className="space-x-4">
                    <Button
                      onClick={() => updateRequest(request.id, 'APPROVED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateRequest(request.id, 'DECLINED')}
                      variant="destructive"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 