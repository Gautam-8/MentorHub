import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { Navbar } from '@/components/Navbar';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MentorHub - Peer Mentoring Platform',
  description: 'Connect with mentors and mentees for meaningful learning experiences',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={inter.className + ' bg-white dark:bg-black text-black dark:text-white transition-colors duration-300'}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
