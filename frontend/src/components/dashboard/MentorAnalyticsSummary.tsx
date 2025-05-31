"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Star, BarChart2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function MentorAnalyticsSummary() {
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

  if (loading) return <div className="text-neutral-400 dark:text-neutral-500">Loading analytics...</div>;
  if (!data) return <div className="text-neutral-400 dark:text-neutral-500">No analytics data available.</div>;

  const chartData = {
    labels: Object.keys(data.sessionsPerWeek).reverse(),
    datasets: [
      {
        label: 'Sessions',
        data: Object.values(data.sessionsPerWeek).reverse(),
        backgroundColor: 'rgba(30,30,30,0.7)',
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <div className="w-full mt-14">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <Card className="bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col items-center p-6 group cursor-pointer">
          <CardHeader className="flex flex-col items-center">
            <Star className="w-7 h-7 mb-2 text-neutral-400 dark:text-neutral-500 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg font-semibold text-black dark:text-white uppercase tracking-wide mb-1">Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-black dark:text-white mb-1">{data.avgRating ? `★ ${data.avgRating.toFixed(2)}` : '—'}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">(out of 5)</span>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col items-center p-6 group cursor-pointer">
          <CardHeader className="flex flex-col items-center">
            <BarChart2 className="w-7 h-7 mb-2 text-neutral-400 dark:text-neutral-500 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg font-semibold text-black dark:text-white uppercase tracking-wide mb-1">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-black dark:text-white mb-1">{data.sessionCount}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">(all time)</span>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-black/70 backdrop-blur rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col items-center p-6 group cursor-pointer md:col-span-1">
          <CardHeader className="flex flex-col items-center">
            <BarChart2 className="w-7 h-7 mb-2 text-neutral-400 dark:text-neutral-500 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-lg font-semibold text-black dark:text-white uppercase tracking-wide mb-1">Sessions Per Week</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center w-full">
            <div className="h-32 w-full">
              <Bar data={chartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { color: 'rgba(0,0,0,0.04)', display: false },
                    ticks: { color: '#888', font: { size: 12, weight: 'bold' } },
                  },
                  y: {
                    grid: { color: 'rgba(0,0,0,0.04)', display: false },
                    ticks: { color: '#888', font: { size: 12, weight: 'bold' } },
                  },
                },
              }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 