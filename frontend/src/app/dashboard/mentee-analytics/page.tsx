'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MenteeAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/mentee/${user.id}`, {
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mentee Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.mentors.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No mentors yet</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          data.mentors.map((mentor: any) => (
            <Card key={mentor.name}>
              <CardHeader>
                <CardTitle>{mentor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-yellow-500">{mentor.avgRating ? `★ ${mentor.avgRating.toFixed(2)}` : 'No ratings yet'}</span>
                </div>
                <div>Sessions: {mentor.sessionCount}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 