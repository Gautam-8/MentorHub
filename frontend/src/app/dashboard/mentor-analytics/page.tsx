"use client";

import { MentorAnalyticsSummary } from '@/components/dashboard/MentorAnalyticsSummary';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function MentorAnalyticsPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/mentor/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((d) => setFeedback(Array.isArray(d) ? d : []))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-10">Mentor Analytics</h1>
      <MentorAnalyticsSummary />
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Recent Feedback</h2>
        {loading ? (
          <div className="text-neutral-400 dark:text-neutral-500">Loading feedback...</div>
        ) : !Array.isArray(feedback) || feedback.length === 0 ? (
          <div className="text-neutral-400 dark:text-neutral-500">No feedback yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedback.map((fb) => (
              <Card key={fb.id} className="bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md p-4">
                <CardHeader className="flex flex-row items-center gap-3 mb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-black dark:text-white">{fb.fromUserName}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-black dark:text-white">{fb.rating}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 dark:text-neutral-300 italic">{fb.comment || <span className="text-neutral-400">No comment</span>}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 