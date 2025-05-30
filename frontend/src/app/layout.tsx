import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MentorHub',
  description: 'Full Stack Peer Mentoring Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-gray-50 min-h-screen'}>
        <AuthProvider>
          <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
                {/* Logo can be replaced with an image if available */}
                MentorHub
              </Link>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard/calendar" className="hover:text-blue-600">Calendar</Link>
              <Link href="/dashboard/sessions" className="hover:text-blue-600">Sessions</Link>
              <Link href="/dashboard/mentor-analytics" className="hover:text-blue-600">Mentor Analytics</Link>
              <Link href="/dashboard/mentee-analytics" className="hover:text-blue-600">Mentee Analytics</Link>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
