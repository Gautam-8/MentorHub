'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { FeedbackModal } from '@/components/dashboard/FeedbackModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, Calendar as CalendarIcon, Users, User, ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  scheduledAt: string;
  startTime: string;
  endTime: string;
  status: string;
  mentor: {
    id: string;
    name: string;
  };
  mentee: {
    id: string;
    name: string;
  };
  availability?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  meetLink: string;
}

interface Feedback {
  rating: number;
  comment?: string;
}

interface TimeSlot {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  mentor: {
    id: string;
    name: string;
  };
}

interface SessionRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  note?: string;
  mentee: {
    id: string;
    name: string;
  };
  availability: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSession, setFeedbackSession] = useState<Session | null>(null);
  const [feedbackRecipient, setFeedbackRecipient] = useState<string>('');
  const [feedbackRecipientId, setFeedbackRecipientId] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback | null>>({});
  const [viewFeedback, setViewFeedback] = useState<Feedback>({ rating: 0, comment: '' });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null);
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [isDeletingAvailability, setIsDeletingAvailability] = useState(false);
  const [isHandlingRequest, setIsHandlingRequest] = useState(false);
  const [isRequestingSession, setIsRequestingSession] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [mentors, setMentors] = useState<Array<{ id: string; name: string }>>([]);
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (user?.role === 'MENTOR') {
      setSelectedMentorId(user.id);
    } else if (user?.role === 'MENTEE') {
      fetchMentors();
    }
  }, [user?.role, user?.id]);

  useEffect(() => {
    if (user?.role === 'MENTEE' && mentors.length > 0 && !selectedMentorId) {
      setSelectedMentorId(mentors[0].id);
    }
  }, [mentors, user?.role, selectedMentorId]);

  useEffect(() => {
    if (selectedMentorId) {
      fetchTimeSlots();
      fetchSessions();
    }
  }, [currentDate, selectedMentorId]);

  useEffect(() => {
    if (sessions.length && user) {
      sessions.forEach((session) => {
        const recipientId = user.role === 'MENTOR' ? session.mentee.id : session.mentor.id;
        fetchFeedback(session.id, user.id, recipientId);
      });
    }
  }, [sessions, user?.id, user?.role]);

  useEffect(() => {
    if (selectedMentorId) {
      fetchSessionRequests();
    }
  }, [selectedMentorId]);

  const fetchTimeSlots = async () => {
    try {
      const startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd');
      
      const url = user?.role === 'MENTOR' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/availability/mentor/${user.id}?startDate=${startDate}&endDate=${endDate}`
        : `${process.env.NEXT_PUBLIC_API_URL}/availability/mentor/${selectedMentorId}?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch time slots');
      
      const data = await response.json();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load time slots');
      setTimeSlots([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      
      // Filter sessions based on role and selected mentor
      const filteredSessions = Array.isArray(data) ? data.filter((session: Session) => {
        const matchesRole = user?.role === 'MENTOR' 
          ? session.mentor.id === user.id 
          : session.mentor.id === selectedMentorId;
        
        return matchesRole;
      }) : [];
      
      setSessions(filteredSessions);
    } catch (error) {
      toast.error('Failed to load sessions');
      setSessions([]);
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
      
      if (!res.ok) {
        setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: null }));
        return;
      }

      // Check if there's any content to parse
      const text = await res.text();
      if (!text) {
        setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: null }));
        return;
      }

      // Parse the JSON only if we have content
      const data = JSON.parse(text);
      
      // Only set feedback if we got valid data
      if (data && (data.rating || data.comment)) {
        setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: data }));
      } else {
        setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: null }));
      }
    } catch (err) {
      setFeedbacks((prev) => ({ ...prev, [`${sessionId}_${toUserId}`]: null }));
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/mentors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch mentors');
      
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      toast.error('Failed to load mentors');
    }
  };

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
    }
  };

  const handleAddAvailability = async () => {
    if (!newAvailability.date || !newAvailability.startTime || !newAvailability.endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          date: newAvailability.date,
          startTime: newAvailability.startTime,
          endTime: newAvailability.endTime,
          dayOfWeek: format(parseISO(newAvailability.date), 'EEEE').toUpperCase(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add availability');

      await fetchTimeSlots();
      setIsAddingAvailability(false);
      setNewAvailability({ date: '', startTime: '', endTime: '' });
      toast.success('Availability added successfully');
    } catch (error) {
      toast.error('Failed to add availability');
    }
  };

  const getSlotsForTime = (date: Date, time: string) => {
    if (!timeSlots || !Array.isArray(timeSlots)) return [];
    
    return timeSlots.filter((slot) => {
      if (!slot || !slot.date) return false;
      try {
        return isSameDay(parseISO(slot.date), date) &&
          slot.startTime <= time &&
          slot.endTime > time;
      } catch (error) {
        return false;
      }
    });
  };

  // Helper function to normalize time format
  const normalizeTime = (time: string) => {
    // Remove seconds if present
    return time.split(':').slice(0, 2).join(':');
  };

  const getSessionsForTime = (date: Date, time: string) => {
    if (!sessions || !Array.isArray(sessions)) {
      return [];
    }
    
    return sessions.filter((session) => {
      if (!session || !session.scheduledAt) {
        return false;
      }
      try {
        const sessionDate = parseISO(session.scheduledAt);
        const isSameDate = isSameDay(sessionDate, date);
        
        // Get time from availability if session time is not available
        const sessionStartTime = session.startTime || session.availability?.startTime;
        const sessionEndTime = session.endTime || session.availability?.endTime;
        
        // Convert times to minutes for easier comparison
        const timeToMinutes = (timeStr: string) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const currentTimeMinutes = timeToMinutes(time);
        const startTimeMinutes = sessionStartTime ? timeToMinutes(sessionStartTime) : 0;
        const endTimeMinutes = sessionEndTime ? timeToMinutes(sessionEndTime) : 0;
        
        const isTimeInRange = sessionStartTime && sessionEndTime && 
          currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
        
        return isSameDate && isTimeInRange;
      } catch (error) {
        return false;
      }
    });
  };

  const handleRequestSession = async () => {
    if (!selectedSlot || !user) return;
    
    // Check if there's already a pending request
    const hasPendingRequest = sessionRequests.some(
      request => 
        request.availability.id === selectedSlot.id && 
        request.status === 'PENDING'
    );

    if (hasPendingRequest) {
      toast.error('This slot already has a pending request');
      return;
    }
    
    try {
      setIsRequestingSession(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          availabilityId: selectedSlot.id,
          note: sessionNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to request session');
      
      toast.success('Session requested successfully');
      setSelectedSlot(null);
      setSessionNote('');
      fetchSessions();
      fetchSessionRequests(); // Refresh session requests after creating new one
    } catch (error) {
      toast.error('Failed to request session');
    } finally {
      setIsRequestingSession(false);
    }
  };

  const handleJoinSession = (meetLink: string) => {
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
    setViewFeedback({ rating: 0, comment: '' }); // Reset feedback state
  };

  // Helper: submit feedback
  const submitFeedback = async (rating: number, comment: string = '') => {
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

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to submit feedback');
      }

      // Update local feedback state
      const feedbackKey = `${feedbackSession.id}_${feedbackRecipientId}`;
      setFeedbacks(prev => ({
        ...prev,
        [feedbackKey]: { rating, comment }
      }));

      toast.success('Feedback submitted successfully!');
      
      // Reset all feedback-related state
      setFeedbackSession(null);
      setFeedbackRecipient('');
      setFeedbackRecipientId('');
      setViewFeedback({ rating: 0, comment: '' });
      
      // Refresh sessions to show updated feedback
      fetchSessions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit feedback');
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

  const handleDeleteAvailability = async () => {
    if (!selectedSlot) return;
    
    try {
      setIsDeletingAvailability(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/availability/${selectedSlot.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete availability');
      
      toast.success('Availability removed successfully');
      setSelectedSlot(null);
      fetchTimeSlots();
    } catch (error) {
      toast.error('Failed to remove availability');
    } finally {
      setIsDeletingAvailability(false);
    }
  };

  const getSlotStatus = (slot: TimeSlot) => {
    const pendingRequest = sessionRequests.find(
      request => 
        request.availability.id === slot.id && 
        request.status === 'PENDING'
    );
    
    if (pendingRequest) {
      return {
        type: 'pending',
        request: pendingRequest
      };
    }

    const approvedRequest = sessionRequests.find(
      request => 
        request.availability.id === slot.id && 
        request.status === 'APPROVED'
    );

    if (approvedRequest) {
      return {
        type: 'approved',
        request: approvedRequest
      };
    }

    return {
      type: 'available',
      request: null
    };
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVED' | 'DECLINED') => {
    try {
      setIsHandlingRequest(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action.toLowerCase()} request`);
      
      toast.success(`Request ${action.toLowerCase()}d successfully`);
      setSelectedRequest(null);
      fetchSessions();
      fetchSessionRequests();
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} request`);
    } finally {
      setIsHandlingRequest(false);
    }
  };

  const getFilteredTimeSlots = () => {
    if (selectedMentorId === 'all') return timeSlots;
    return timeSlots.filter(slot => slot.mentor.id === selectedMentorId);
  };

  const getFilteredSessions = () => {
    if (selectedMentorId === 'all') return sessions;
    return sessions.filter(session => session.mentor.id === selectedMentorId);
  };

  const getSessionDetails = (session: Session) => {
    const feedback = feedbacks[`${session.id}_${user?.role === 'MENTOR' ? session.mentee.id : session.mentor.id}`];
    const isPastSession = new Date(session.scheduledAt) < new Date();
    const canGiveFeedback = isPastSession && !feedback;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs">
              {getInitials(session.mentor.name)}
            </div>
            <span className="text-xs font-medium">{session.mentor.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs">
              {getInitials(session.mentee.name)}
            </div>
            <span className="text-xs font-medium">{session.mentee.name}</span>
          </div>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {session.startTime} - {session.endTime}
        </div>
        {session.meetLink && (
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleJoinSession(session.meetLink);
            }}
          >
            Join Session
          </Button>
        )}
        {canGiveFeedback && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              openFeedbackModal(session);
            }}
          >
            Give Feedback
          </Button>
        )}
        {feedback && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{feedback.rating}/5</span>
            {feedback.comment && (
              <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                - {feedback.comment}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const fetchSessionDetails = async (requestId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sessions/request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch session details');
      
      const session = await response.json();
      setSelectedSession(session);

      // Fetch feedback for the session
      if (user) {
        // If user is mentor, they are the fromUserId and mentee is toUserId
        // If user is mentee, they are the fromUserId and mentor is toUserId
        const fromUserId = user.id;
        const toUserId = user.role === 'MENTOR' ? session.mentee.id : session.mentor.id;
        fetchFeedback(session.id, fromUserId, toUserId);
      }
    } catch (error) {
      toast.error('Failed to load session details');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative container mx-auto py-10">
      {/* Simple Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {user?.role === 'MENTOR' ? 'Your Availability' : 'Mentor Schedule'}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {user?.role === 'MENTOR' 
            ? 'Manage your available time slots for mentoring sessions'
            : 'Browse and book sessions with available mentors'}
        </p>
      </div>

      {/* Calendar Section */}
      <div className="relative z-10 w-full bg-white/70 dark:bg-black/70 backdrop-blur rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 transition-all">
        {/* Calendar Header - Fixed */}
        <div className="sticky top-0 bg-white/70 dark:bg-black/70 backdrop-blur z-20 pb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">
              {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'MENTEE' && (
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedMentorId}
                  onValueChange={setSelectedMentorId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentIndex = mentors.findIndex(m => m.id === selectedMentorId);
                    const nextIndex = (currentIndex + 1) % mentors.length;
                    setSelectedMentorId(mentors[nextIndex].id);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                onClick={() => setView('month')}
              >
                Month
              </Button>
              {user?.role === 'MENTOR' && (
                <Button
                  onClick={() => setIsAddingAvailability(true)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid - Scrollable */}
        <div className="mt-4 h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-8 gap-px bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
            {/* Time Column - Fixed */}
            <div className="bg-white dark:bg-black p-2 sticky left-0 z-10">
              <div className="h-12" /> {/* Header spacer */}
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                return (
                  <div key={`${hour}:${minute}`} className="h-12 text-sm text-neutral-500 dark:text-neutral-400">
                    {`${hour.toString().padStart(2, '0')}:${minute}`}
                  </div>
                );
              })}
            </div>

            {/* Day Columns */}
            {eachDayOfInterval({
              start: startOfWeek(currentDate),
              end: endOfWeek(currentDate),
            }).map((day) => (
              <div key={day.toString()} className="bg-white dark:bg-black">
                {/* Day Header - Fixed */}
                <div className="h-12 p-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-black z-10">
                  <div className="text-sm font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-2xl font-bold">
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Time Slots - Scrollable */}
                {Array.from({ length: 48 }, (_, i) => {
                  const hour = Math.floor(i / 2);
                  const minute = i % 2 === 0 ? '00' : '30';
                  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                  const slots = getSlotsForTime(day, time);
                  const sessions = getSessionsForTime(day, time);
                  
                  return (
                    <div
                      key={time}
                      className={cn(
                        "h-12 p-1 border-b border-neutral-200 dark:border-neutral-800",
                        slots.length > 0 && "bg-green-50 dark:bg-green-900/20",
                        sessions.length > 0 && "bg-blue-50 dark:bg-blue-900/20",
                        (user?.role === 'MENTOR' || (user?.role === 'MENTEE' && slots.length > 0)) && "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      )}
                      onClick={(e) => {
                        // If clicking on a session, don't do anything
                        if (e.target instanceof HTMLElement && e.target.closest('[data-session]')) {
                          return;
                        }

                        if (sessions.length > 0) {
                          setSelectedSession(sessions[0]);
                          return;
                        }
                        
                        if (user?.role === 'MENTOR') {
                          if (slots.length > 0) {
                            const slot = slots[0];
                            const status = getSlotStatus(slot);
                            
                            if (status.type === 'pending') {
                              setSelectedRequest(status.request);
                            } else if (status.type === 'available') {
                              setSelectedSlot(slot);
                            } else if (status.type === 'approved' && status.request) {
                              fetchSessionDetails(status.request.id);
                            }
                          } else {
                            setNewAvailability({
                              date: format(day, 'yyyy-MM-dd'),
                              startTime: time,
                              endTime: Array.from({ length: 48 }, (_, j) => {
                                const hour = Math.floor(j / 2);
                                const minute = j % 2 === 0 ? '00' : '30';
                                return `${hour.toString().padStart(2, '0')}:${minute}`;
                              })[i + 1] || '23:59',
                            });
                            setIsAddingAvailability(true);
                          }
                        } else if (user?.role === 'MENTEE' && slots.length > 0) {
                          const slot = slots[0];
                          const status = getSlotStatus(slot);
                          
                          if (status.type === 'available') {
                            setSelectedSlot(slot);
                          } else if (status.type === 'approved' && status.request) {
                            fetchSessionDetails(status.request.id);
                          }
                        }
                      }}
                    >
                      {slots.map((slot) => {
                        const status = getSlotStatus(slot);
                        return (
                          <div
                            key={slot.id}
                            className={cn(
                              "text-white text-xs p-1 rounded mb-1",
                              status.type === 'available' && "bg-green-500",
                              status.type === 'pending' && "bg-yellow-500",
                              status.type === 'approved' && "bg-blue-500"
                            )}
                          >
                            {status.type === 'available' && (
                              <>Available ({slot.startTime} - {slot.endTime})</>
                            )}
                            {status.type === 'pending' && (
                              <>Pending Request ({slot.startTime} - {slot.endTime})</>
                            )}
                            {status.type === 'approved' && (
                              <>Booked ({slot.startTime} - {slot.endTime})</>
                            )}
                          </div>
                        );
                      })}
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          data-session="true"
                          className={cn(
                            "text-white text-xs p-1 rounded cursor-pointer hover:opacity-90",
                            session.status === 'PENDING' ? "bg-yellow-500" : "bg-blue-500"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs">
                                {getInitials(session.mentor.name)}
                              </div>
                              <span className="text-xs font-medium">{session.mentor.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs">
                                {getInitials(session.mentee.name)}
                              </div>
                              <span className="text-xs font-medium">{session.mentee.name}</span>
                            </div>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {session.startTime} - {session.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Handling Dialog */}
      <Dialog 
        open={!!selectedRequest} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  Request from {selectedRequest.mentee.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(parseISO(selectedRequest.availability.date), 'EEEE, MMMM d')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedRequest.availability.startTime} - {selectedRequest.availability.endTime}
                </span>
              </div>
              {selectedRequest.note && (
                <div className="text-sm text-neutral-500">
                  Note: {selectedRequest.note}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleRequestAction(selectedRequest.id, 'DECLINED')}
                  disabled={isHandlingRequest}
                  className="flex-1"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => handleRequestAction(selectedRequest.id, 'APPROVED')}
                  disabled={isHandlingRequest}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Availability Management Dialog */}
      <Dialog 
        open={!!selectedSlot} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null);
            setSelectedRequest(null);
            setSessionNote('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user?.role === 'MENTOR' ? 'Manage Availability' : 'Request Session'}
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {format(parseISO(selectedSlot.date), 'EEEE, MMMM d')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </span>
              </div>
              
              {user?.role === 'MENTOR' ? (
                <Button
                  variant="destructive"
                  onClick={handleDeleteAvailability}
                  disabled={isDeletingAvailability}
                  className="w-full"
                >
                  Remove Availability
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note (Optional)</label>
                    <Input
                      placeholder="Add a note for the mentor..."
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleRequestSession}
                    disabled={isRequestingSession}
                    className="w-full"
                  >
                    Request Session
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Availability Dialog */}
      <Dialog 
        open={isAddingAvailability} 
        onOpenChange={(open) => {
          setIsAddingAvailability(open);
          if (!open) {
            setNewAvailability({ date: '', startTime: '', endTime: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newAvailability.date}
                onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={newAvailability.startTime}
                onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                value={newAvailability.endTime}
                onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingAvailability(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAvailability}>
              Add Availability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog 
        open={!!feedbackSession} 
        onOpenChange={(open) => {
          if (!open) {
            setFeedbackSession(null);
            setFeedbackRecipient('');
            setFeedbackRecipientId('');
            setViewFeedback({ rating: 0, comment: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
          </DialogHeader>
          {feedbackSession && (
            <div className="space-y-4">
              <div className="text-sm">
                How was your session with {feedbackRecipient}?
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="icon"
                    className="w-10 h-10"
                    onClick={() => setViewFeedback(prev => ({ ...prev, rating }))}
                  >
                    <Star className={cn(
                      "w-5 h-5",
                      rating <= viewFeedback.rating && "fill-yellow-400 text-yellow-400"
                    )} />
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments (Optional)</label>
                <Input
                  placeholder="Share your experience..."
                  value={viewFeedback.comment}
                  onChange={(e) => setViewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>
              <Button
                onClick={() => submitFeedback(viewFeedback.rating, viewFeedback.comment)}
                className="w-full"
                disabled={viewFeedback.rating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog 
        open={!!selectedSession} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSession(null);
            setViewFeedback({ rating: 0, comment: '' }); // Reset feedback state when closing
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {format(parseISO(selectedSession.scheduledAt), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {selectedSession.startTime} - {selectedSession.endTime}
                  </span>
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                      {getInitials(selectedSession.mentor.name)}
                    </div>
                    <div>
                      <div className="font-medium">Mentor</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {selectedSession.mentor.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                      {getInitials(selectedSession.mentee.name)}
                    </div>
                    <div>
                      <div className="font-medium">Mentee</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {selectedSession.mentee.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meet Link */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Meeting Link</div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm break-all">
                    {selectedSession.meetLink || 'Meeting link not available'}
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              {(() => {
                if (!user) return null;

                const fromUserId = user.id;
                const toUserId = user.role === 'MENTOR' ? selectedSession.mentee.id : selectedSession.mentor.id;
                const feedbackKey = `${selectedSession.id}_${toUserId}`;
                const feedback = feedbacks[feedbackKey];

                const isPastSession = new Date(selectedSession.scheduledAt) < new Date();
                const canGiveFeedback = isPastSession && !feedback;

                if (canGiveFeedback) {
                  return (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Give Feedback</div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="outline"
                            size="icon"
                            className="w-10 h-10"
                            onClick={() => setViewFeedback(prev => ({ ...prev, rating }))}
                          >
                            <Star className={cn(
                              "w-5 h-5",
                              rating <= viewFeedback.rating && "fill-yellow-400 text-yellow-400"
                            )} />
                          </Button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Comments (Optional)</label>
                        <Input
                          placeholder="Share your experience..."
                          value={viewFeedback.comment}
                          onChange={(e) => setViewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          // Set the feedback session before submitting
                          setFeedbackSession(selectedSession);
                          setFeedbackRecipient(user.role === 'MENTOR' ? selectedSession.mentee.name : selectedSession.mentor.name);
                          setFeedbackRecipientId(toUserId);
                          submitFeedback(viewFeedback.rating, viewFeedback.comment);
                        }}
                        className="w-full"
                        disabled={viewFeedback.rating === 0}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  );
                }

                if (feedback && (feedback.rating || feedback.comment)) {
                  return (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Feedback</div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{feedback.rating}/5</span>
                        </div>
                        {feedback.comment && (
                          <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            {feedback.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 