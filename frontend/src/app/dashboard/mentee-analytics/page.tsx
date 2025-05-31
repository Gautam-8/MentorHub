'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Star, Users, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Mentor {
  id: string;
  name: string;
  sessions: number;
  averageRating: number;
}

interface MenteeAnalytics {
  totalSessions: number;
  mentors: Mentor[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MenteeAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<MenteeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/analytics/mentee`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const mentorChartData = {
    labels: analytics.mentors.map(m => m.name),
    datasets: [
      {
        label: 'Sessions per Mentor',
        data: analytics.mentors.map(m => m.sessions),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold">Mentee Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your learning journey</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
              <CardDescription>Your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalSessions}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Sessions completed with {analytics.mentors.length} mentors
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Learning Impact</CardTitle>
              <CardDescription>Your mentoring relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{mentor.name}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {mentor.sessions} sessions
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mentor.averageRating.toFixed(1)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Sessions Distribution</CardTitle>
            <CardDescription>Number of sessions with each mentor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar
                data={mentorChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 