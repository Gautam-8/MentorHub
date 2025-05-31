'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MENTOR' | 'MENTEE'>('MENTEE');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      await signup(name, email, password, role);
      toast.success('Signup successful!');
      router.push('/dashboard/calendar');
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
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
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col gap-6 relative z-10 border border-neutral-200 dark:border-neutral-800 transition-colors duration-300"
        >
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">Create your account</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Sign up to start your mentoring journey</p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`text-base transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center gap-1"
                >
                  <XCircle size={14} /> {errors.name}
                </motion.p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`text-base transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center gap-1"
                >
                  <XCircle size={14} /> {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`text-base pr-12 transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
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
                  className="text-red-500 text-sm mt-1 flex items-center gap-1"
                >
                  <XCircle size={14} /> {errors.password}
                </motion.p>
              )}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i < getPasswordStrength()
                            ? 'bg-neutral-800 dark:bg-neutral-200'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Password strength: {getPasswordStrength()}/5
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                className={`px-6 py-2.5 rounded-full font-semibold border transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-neutral-200 dark:border-neutral-800 shadow-md ${role === 'MENTEE' ? 'ring-2 ring-neutral-800 dark:ring-neutral-200' : ''}`}
                onClick={() => setRole('MENTEE')}
              >
                Mentee
              </button>
              <button
                type="button"
                className={`px-6 py-2.5 rounded-full font-semibold border transition-all duration-200 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-neutral-200 dark:border-neutral-800 shadow-md ${role === 'MENTOR' ? 'ring-2 ring-neutral-800 dark:ring-neutral-200' : ''}`}
                onClick={() => setRole('MENTOR')}
              >
                Mentor
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black text-lg font-bold py-3 rounded-full shadow-lg transition-all duration-200 hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:shadow-xl disabled:opacity-70 border border-neutral-300 dark:border-neutral-700"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </Button>

          <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-2">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-black dark:text-white font-semibold hover:underline"
            >
              Log in
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 dark:text-neutral-500">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span>Free</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 