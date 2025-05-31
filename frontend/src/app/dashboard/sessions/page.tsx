'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, Clock, Calendar, Star, MessageSquare, X, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Availability {
  id: string;
  mentor: {
    id: string;
    name: string;
    expertise?: string[];
    rating?: number;
    avatarUrl?: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface SessionRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  note?: string;
  session?: {
    id: string;
    meetLink: string;
  };
  mentor: {
    id: string;
    name: string;
    expertise?: string[];
    rating?: number;
    avatarUrl?: string;
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
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

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
        body: JSON.stringify({ 
          availabilityId,
          note: note.trim() || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request session: ${response.status}`);
      }

      toast.success('Session request sent successfully');
      setNote('');
      setSelectedAvailability(null);
      fetchSessionRequests();
    } catch (error) {
      console.error('Error requesting session:', error);
      toast.error('Failed to request session');
    }
  };

  const cancelSessionRequest = async (requestId: string) => {
    try {
      setIsCancelling(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel session request: ${response.status}`);
      }

      toast.success('Session request cancelled successfully');
      fetchSessionRequests();
    } catch (error) {
      console.error('Error cancelling session request:', error);
      toast.error('Failed to cancel session request');
    } finally {
      setIsCancelling(false);
      setCancelRequestId(null);
    }
  };

  const filteredAvailabilities = availabilities.filter((availability) =>
    availability.mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = sessionRequests.filter((request) =>
    request.mentor.name.toLowerCase().includes(requestSearchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'DECLINED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const joinSession = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-black dark:text-white">Something went wrong</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md">
            {error}
          </p>
          <Button
            onClick={() => {
              setError(null);
              fetchAvailabilities();
              fetchSessionRequests();
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Common Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent mb-2">
          Sessions
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Find mentors and manage your session requests
        </p>
      </motion.div>

      {/* Tabs Layout with Enhanced Styling */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <TabsTrigger 
            value="available" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Available Slots
          </TabsTrigger>
          <TabsTrigger 
            value="requests" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Your Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search Bar with Enhanced Glass Effect */}
            <div className="relative w-full group mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-neutral-500/10 dark:from-white/10 dark:to-neutral-400/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" size={20} />
                <Input
                  type="text"
                  placeholder="Search by mentor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 w-full bg-white/80 dark:bg-black/80 backdrop-blur border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white transition-all duration-300 rounded-2xl text-lg"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {filteredAvailabilities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 bg-white/80 dark:bg-black/80 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="bg-neutral-100 dark:bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-3">No available slots found</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-lg">
                    {searchQuery ? 'Try adjusting your search' : 'Check back later for new availability'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredAvailabilities.map((availability, index) => (
                    <motion.div
                      key={availability.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="bg-white/80 dark:bg-black/80 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-black to-neutral-600 dark:from-white dark:to-neutral-400 flex items-center justify-center overflow-hidden ring-2 ring-neutral-200 dark:ring-neutral-800">
                              {availability.mentor?.avatarUrl ? (
                                <img
                                  src={availability.mentor.avatarUrl}
                                  alt={availability.mentor.name}
                                  className="h-14 w-14 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-semibold text-white dark:text-black">
                                  {availability.mentor?.name?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-black dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                                {availability.mentor?.name || 'Unknown Mentor'}
                              </CardTitle>
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {availability.mentor?.rating?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {(availability.mentor?.expertise || []).map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="secondary" 
                                  className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm px-3 py-1"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                                <Calendar className="h-4 w-4 mr-2" />
                                {availability.dayOfWeek}
                              </div>
                              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                                <Clock className="h-4 w-4 mr-2" />
                                {availability.startTime} - {availability.endTime}
                              </div>
                            </div>

                            {selectedAvailability?.id === availability.id ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="h-4 w-4 text-neutral-500" />
                                  <span className="text-sm font-medium">Add a note (optional)</span>
                                </div>
                                <Textarea
                                  placeholder="What would you like to discuss in this session?"
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  className="w-full bg-white/50 dark:bg-black/50 border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white transition-all duration-300 rounded-xl"
                                />
                                <div className="flex space-x-3">
                                  <Button
                                    onClick={() => requestSession(availability.id)}
                                    className="flex-1 bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 text-white dark:text-black hover:opacity-90 transition-opacity rounded-xl"
                                  >
                                    Confirm Request
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAvailability(null);
                                      setNote('');
                                    }}
                                    className="flex-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-xl"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <Button
                                onClick={() => setSelectedAvailability(availability)}
                                disabled={sessionRequests.some(
                                  (request) =>
                                    request.availability.id === availability.id &&
                                    request.status === 'PENDING',
                                )}
                                className="w-full bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-50 rounded-xl h-11"
                              >
                                Request Session
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        <TabsContent value="requests" className="mt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search Bar with Enhanced Glass Effect */}
            <div className="relative w-full group mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-neutral-500/10 dark:from-white/10 dark:to-neutral-400/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" size={20} />
                <Input
                  type="text"
                  placeholder="Search by mentor name..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  className="pl-12 h-12 w-full bg-white/80 dark:bg-black/80 backdrop-blur border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white transition-all duration-300 rounded-2xl text-lg"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {filteredRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 bg-white/80 dark:bg-black/80 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="bg-neutral-100 dark:bg-neutral-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-black dark:text-white mb-3">No session requests yet</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-lg">
                    {user?.role === 'MENTEE' 
                      ? 'Request a session from available slots to get started'
                      : 'You haven\'t received any session requests yet'}
                  </p>
                  {user?.role === 'MENTEE' && (
                    <Button
                      onClick={() => {
                        const firstAvailability = filteredAvailabilities[0];
                        if (firstAvailability) {
                          setSelectedAvailability(firstAvailability);
                        }
                      }}
                      className="bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 text-white dark:text-black hover:opacity-90 transition-opacity rounded-xl px-6"
                    >
                      Find Available Slots
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="bg-white/80 dark:bg-black/80 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-black to-neutral-600 dark:from-white dark:to-neutral-400 flex items-center justify-center overflow-hidden ring-2 ring-neutral-200 dark:ring-neutral-800">
                              {request.mentor?.avatarUrl ? (
                                <img
                                  src={request.mentor.avatarUrl}
                                  alt={request.mentor.name}
                                  className="h-14 w-14 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-semibold text-white dark:text-black">
                                  {request.mentor?.name?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-black dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                                {request.mentor?.name || 'Unknown Mentor'}
                              </CardTitle>
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {request.mentor?.rating?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn(
                              "transition-colors duration-300 px-3 py-1",
                              getStatusColor(request.status)
                            )}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(request.status)}
                                <span>{request.status}</span>
                              </div>
                            </Badge>
                            {request.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCancelRequestId(request.id)}
                                className="h-8 w-8 text-neutral-500 hover:text-red-500 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {(request.mentor?.expertise || []).map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="secondary" 
                                  className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm px-3 py-1"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                                <Calendar className="h-4 w-4 mr-2" />
                                {request.availability.dayOfWeek}
                              </div>
                              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                                <Clock className="h-4 w-4 mr-2" />
                                {request.availability.startTime} - {request.availability.endTime}
                              </div>
                            </div>

                            {request.note && (
                              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <MessageSquare className="h-4 w-4 text-neutral-500" />
                                  <span className="text-sm font-medium">Note</span>
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{request.note}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Requested on {format(new Date(request.createdAt), 'PPP')}
                              </p>
                              {request.status === 'APPROVED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => joinSession('https://meet.google.com/test-link')}
                                  className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors rounded-xl"
                                >
                                  Join Session
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Alert Dialog */}
      <AlertDialog open={!!cancelRequestId} onOpenChange={() => setCancelRequestId(null)}>
        <AlertDialogContent className="bg-white/90 dark:bg-black/90 backdrop-blur border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Cancel Session Request</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to cancel this session request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isCancelling}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelRequestId && cancelSessionRequest(cancelRequestId)}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 