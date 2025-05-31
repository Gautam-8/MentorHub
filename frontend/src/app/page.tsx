'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Star, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard/calendar');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="relative z-10 flex flex-1 items-center justify-center py-12 px-2">
        <div className="w-full max-w-5xl bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 px-0 md:px-12 py-10 md:py-16 flex flex-col gap-12 transition-colors duration-300">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-4 drop-shadow-lg leading-tight">
              Connect. Mentor. <span className="text-neutral-400 dark:text-neutral-500">Grow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-8 max-w-2xl">
              MentorHub is your all-in-one peer mentoring platform. Find mentors, schedule sessions, track your progress, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
              <Button
                size="lg"
                className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-lg px-8 py-4 rounded-full shadow-lg font-bold border border-neutral-300 dark:border-neutral-700 transition-colors duration-300"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </section>
          {/* Features Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl mx-auto px-4">
            <div className="bg-neutral-100/80 dark:bg-neutral-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-transform hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm transition-colors duration-300">
              <Users className="text-black dark:text-white mb-3 w-8 h-8" />
              <h3 className="font-semibold text-lg mb-1 text-black dark:text-white">Find Mentors & Mentees</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Browse and connect with the right people for your growth journey.</p>
            </div>
            <div className="bg-neutral-100/80 dark:bg-neutral-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-transform hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm transition-colors duration-300">
              <Calendar className="text-black dark:text-white mb-3 w-8 h-8" />
              <h3 className="font-semibold text-lg mb-1 text-black dark:text-white">Easy Scheduling</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Book sessions with a click and manage your availability with ease.</p>
            </div>
            <div className="bg-neutral-100/80 dark:bg-neutral-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-transform hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm transition-colors duration-300">
              <Star className="text-black dark:text-white mb-3 w-8 h-8" />
              <h3 className="font-semibold text-lg mb-1 text-black dark:text-white">Track Progress & Feedback</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Get real feedback and see your growth over time.</p>
            </div>
            <div className="bg-neutral-100/80 dark:bg-neutral-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-transform hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm transition-colors duration-300">
              <TrendingUp className="text-black dark:text-white mb-3 w-8 h-8" />
              <h3 className="font-semibold text-lg mb-1 text-black dark:text-white">Analytics & Insights</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Visualize your journey with beautiful analytics and reports.</p>
            </div>
          </section>
          {/* How It Works Section */}
          <section className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">📝</div>
                <h4 className="font-semibold mb-1 text-black dark:text-white">Sign Up</h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Create your free account as a mentor or mentee.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">📆</div>
                <h4 className="font-semibold mb-1 text-black dark:text-white">Book or Offer Sessions</h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Mentors set their availability, mentees book sessions.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">🤝</div>
                <h4 className="font-semibold mb-1 text-black dark:text-white">Meet & Grow</h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">Join sessions, exchange feedback, and grow together.</p>
              </div>
            </div>
          </section>
          {/* Testimonials Section */}
          <section className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-8">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur flex items-center justify-center text-2xl mb-3 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">👩‍🎓</div>
                <p className="text-neutral-700 dark:text-neutral-300 italic mb-2">“MentorHub helped me find the perfect mentor and boosted my confidence!”</p>
                <span className="font-semibold text-black dark:text-white">Alice, Mentee</span>
              </div>
              <div className="bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 backdrop-blur flex items-center justify-center text-2xl mb-3 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">👨‍🏫</div>
                <p className="text-neutral-700 dark:text-neutral-300 italic mb-2">“The scheduling and feedback features make mentoring a breeze.”</p>
                <span className="font-semibold text-black dark:text-white">Bob, Mentor</span>
              </div>
            </div>
          </section>
          {/* Footer */}
          <footer className="w-full pt-8 text-center text-neutral-500 dark:text-neutral-400 text-sm mt-8">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>&copy; {new Date().getFullYear()} MentorHub</div>
              <div className="flex gap-4">
                <Link href="/about" className="underline">About</Link>
                <Link href="/contact" className="underline">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
