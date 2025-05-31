"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Helper for avatar initials
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md rounded-b-2xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl font-extrabold text-black dark:text-white tracking-tight hover:scale-105 transition-transform">
          MentorHub
        </Link>
      </div>
      
      {user ? (
        <div className="flex items-center gap-6">
          <Link href="/dashboard/calendar" className="nav-link text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white">Calendar</Link>
          {user.role === 'MENTOR' ? (
            <>
              <Link href="/dashboard/availability" className="nav-link text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white">Availability</Link>
              <Link href="/dashboard/mentor-requests" className="nav-link text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white">Requests</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/sessions" className="nav-link text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white">Find Sessions</Link>
              <Link href="/dashboard/mentee-analytics" className="nav-link text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white">Analytics</Link>
            </>
          )}
          {/* Avatar and dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-sm font-bold text-black dark:text-white">
                {getInitials(user.name)}
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-lg py-1 z-50">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign up</Button>
          </Link>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
} 