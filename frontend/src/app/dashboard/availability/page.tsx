"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, Calendar, Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

// Helper to format day for display
const formatDay = (day: string) => {
  return day.charAt(0) + day.slice(1).toLowerCase();
};

// Helper to convert HH:mm to minutes
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('09:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('10:00');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/mentor/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = async () => {
    if (selectedStartTime >= selectedEndTime) {
      toast.error('End time must be after start time');
      return;
    }
    // Overlap validation (using minutes for robust comparison)
    const daySlots = slots.filter(slot => slot.dayOfWeek === selectedDay);
    const newStart = timeToMinutes(selectedStartTime);
    const newEnd = timeToMinutes(selectedEndTime);
    const isOverlap = daySlots.some(slot => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      // Overlap if newStart < slotEnd && newEnd > slotStart
      return newStart < slotEnd && newEnd > slotStart;
    });
    if (isOverlap) {
      toast.error('This time slot overlaps with an existing slot. Please choose a different time.');
      return;
    }
    setAdding(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
        }),
      });
      if (!response.ok) throw new Error('Failed to add slot');
      toast.success('Time slot added');
      fetchAvailability();
    } catch (error) {
      toast.error('Failed to add slot');
    } finally {
      setAdding(false);
    }
  };

  // Optional: implement delete if supported by backend
  const removeTimeSlot = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete slot');
      toast.success('Time slot removed');
      fetchAvailability();
    } catch (error) {
      toast.error('Failed to remove slot');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-neutral-400 dark:text-neutral-500">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Blurred/animated background shape */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-neutral-200/60 via-neutral-100/40 to-white/0 dark:from-neutral-900/60 dark:via-neutral-800/40 dark:to-black/0 rounded-full blur-3xl opacity-60 pointer-events-none select-none z-0 animate-pulse-slow" />
      
      {/* Header */}
      <div className="relative z-10 mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-2">Manage Availability</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Set your available time slots for mentoring sessions</p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Time Slot Card */}
        <Card className="bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-5 h-5" />
              Add Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Day of Week</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {formatDay(day)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Start Time</label>
                <select
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">End Time</label>
                <select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={addTimeSlot}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add Slot'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Schedule Card */}
        <Card className="lg:col-span-2 bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5" />
              Current Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No time slots added yet. Add your first slot to start accepting sessions!
              </div>
            ) : (
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = slots.filter((slot) => slot.dayOfWeek === day);
                  return (
                    <div key={day} className="space-y-2">
                      <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">{formatDay(day)}</h3>
                      {daySlots.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">No slots</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 rounded-lg px-4 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-neutral-500" />
                                <span className="text-sm">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(slot.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 