'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, BarChart, Clock, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function NavMenu() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart,
    },
    ...(user?.role === 'MENTOR'
      ? [
          {
            title: 'Availability',
            href: '/dashboard/availability',
            icon: Clock,
          },
          {
            title: 'Requests',
            href: '/dashboard/mentor-requests',
            icon: MessageSquare,
          },
        ]
      : [
          {
            title: 'Find Mentors',
            href: '/dashboard/mentee/find-mentors',
            icon: Search,
          },
        ]),
  ];

  return (
    <nav className="flex flex-col gap-2">
      {menuItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start',
            pathname === item.href && 'bg-neutral-100 dark:bg-neutral-800'
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
} 