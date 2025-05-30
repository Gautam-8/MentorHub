'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Availability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function AvailabilityPage() {
  const { user, token } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (user?.role === 'MENTOR') {
      fetchAvailabilities();
    }
  }, [user]);

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/mentor/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast.error('Failed to load availability slots');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayOfWeek,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create availability slot');
      }

      toast.success('Availability slot created successfully');
      fetchAvailabilities();
      setDayOfWeek('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error creating availability:', error);
      toast.error('Failed to create availability slot');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete availability slot');
      }

      toast.success('Availability slot deleted successfully');
      fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability slot');
    }
  };

  if (user?.role !== 'MENTOR') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Only mentors can manage their availability.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Availability</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Availability Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Day of Week</label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <Button type="submit">Add Availability</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {availability.dayOfWeek.charAt(0) + availability.dayOfWeek.slice(1).toLowerCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {availability.startTime} - {availability.endTime}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(availability.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            {availabilities.length === 0 && (
              <p className="text-gray-500">No availability slots added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 