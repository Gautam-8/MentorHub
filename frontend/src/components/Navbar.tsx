"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, Calendar, BarChart2, Search, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <nav className="backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-neutral-200/50 dark:border-neutral-800/50 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-neutral-200/20 dark:shadow-neutral-800/20 rounded-b-2xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="text-2xl font-extrabold text-black dark:text-white tracking-tight hover:scale-105 transition-transform"
        >
          MentorHub
        </Link>
        {user && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Welcome back,</span>
            <span className="font-semibold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-full shadow-sm">
              {user.name}
            </span>
          </div>
        )}
      </div>
      
      {user ? (
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/dashboard/calendar" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            {user.role === 'MENTOR' ? (
              <Link 
                href="/dashboard/mentor-analytics" 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                Analytics
              </Link>
            ) : (
              <>
                <Link 
                  href="/dashboard/sessions" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Find Sessions
                </Link>
                <Link 
                  href="/dashboard/mentee-analytics" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <BarChart2 className="w-4 h-4" />
                  Analytics
                </Link>
              </>
            )}
          </div>
          
          {/* Avatar and dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-sm font-bold text-black dark:text-white shadow-sm">
                {getInitials(user.name)}
              </div>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-neutral-500 transition-transform duration-200",
                  dropdownOpen ? "rotate-180" : ""
                )} 
              />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg shadow-neutral-200/20 dark:shadow-neutral-800/20 py-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-neutral-200/50 dark:border-neutral-800/50">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <ThemeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="hover:bg-neutral-100 dark:hover:bg-neutral-900">
              Sign in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200">
              Sign up
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
} 