'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Availability {
  id: string;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface SessionRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  note?: string;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  availability: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  createdAt: string;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailabilities();
    fetchSessionRequests();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch availabilities: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API Response:', data);
      
      if (!Array.isArray(data)) {
        console.log('Converting to array if needed...');
        const dataArray = Array.isArray(data) ? data : [data];
        setAvailabilities(dataArray);
        return;
      }

      setAvailabilities(data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      setError(error instanceof Error ? error.message : 'Failed to load available slots');
      toast.error('Failed to load available slots');
    }
  };

  const fetchSessionRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch session requests: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Session Requests:', data);
      
      if (!Array.isArray(data)) {
        console.log('Converting to array if needed...');
        const dataArray = Array.isArray(data) ? data : [data];
        setSessionRequests(dataArray);
        return;
      }

      setSessionRequests(data);
    } catch (error) {
      console.error('Error fetching session requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load session requests');
      toast.error('Failed to load session requests');
    } finally {
      setLoading(false);
    }
  };

  const requestSession = async (availabilityId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ availabilityId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request session: ${response.status}`);
      }

      toast.success('Session request sent successfully');
      fetchSessionRequests();
    } catch (error) {
      console.error('Error requesting session:', error);
      toast.error('Failed to request session');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Sessions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
          {availabilities.length === 0 ? (
            <p>No available slots at the moment.</p>
          ) : (
            <div className="space-y-4">
              {availabilities.map((availability) => (
                <Card key={availability.id}>
                  <CardHeader>
                    <CardTitle>
                      {availability.mentor?.firstName} {availability.mentor?.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      {availability.dayOfWeek} at {availability.startTime} - {availability.endTime}
                    </p>
                    <Button
                      onClick={() => requestSession(availability.id)}
                      disabled={sessionRequests.some(
                        (request) =>
                          request.availability.id === availability.id &&
                          request.status === 'PENDING',
                      )}
                    >
                      Request Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Session Requests</h2>
          {sessionRequests.length === 0 ? (
            <p>No session requests yet.</p>
          ) : (
            <div className="space-y-4">
              {sessionRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>
                      {request.mentor?.firstName} {request.mentor?.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      {request.availability.dayOfWeek} at {request.availability.startTime} - {request.availability.endTime}
                    </p>
                    <p className="mb-2">Status: {request.status}</p>
                    {request.note && <p className="text-sm text-gray-500">{request.note}</p>}
                    <p className="text-sm text-gray-500">
                      Requested on {format(new Date(request.createdAt), 'PPP')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 