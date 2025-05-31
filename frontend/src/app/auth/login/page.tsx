'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      router.push('/dashboard/calendar');
    } catch (err) {
      toast.error('Invalid email or password');
      setErrors({
        auth: 'Invalid email or password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black transition-colors duration-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col gap-6 relative z-10 border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">Welcome Back</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Sign in to your MentorHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`text-base pl-10 transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={18} />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`text-base pl-10 pr-12 transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={18} />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {errors.auth && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm"
              >
                {errors.auth}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black text-lg font-bold py-3 rounded-full shadow-lg transition-all duration-200 hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:shadow-xl disabled:opacity-70 border border-neutral-300 dark:border-neutral-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-2">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-black dark:text-white font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 dark:text-neutral-500">
              <div className="flex items-center gap-1">
                <Lock size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span>Email Support</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 