'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MentorAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/mentor/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((d) => setData(d))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No analytics data available.</div>;

  const chartData = {
    labels: Object.keys(data.sessionsPerWeek).reverse(),
    datasets: [
      {
        label: 'Sessions',
        data: Object.values(data.sessionsPerWeek).reverse(),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mentor Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl text-yellow-500">{data.avgRating ? `★ ${data.avgRating.toFixed(2)}` : 'No ratings yet'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl">{data.sessionCount}</span>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sessions Per Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 