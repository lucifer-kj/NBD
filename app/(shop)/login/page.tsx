"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, SignInResponse } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginFormContent() {
  const searchParams = useSearchParams();
  
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Recovery Mode State
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Check URL params for error messages
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'customer_not_found') {
        setError('No customer account was found. Please check your credentials or register.');
      } else if (errorParam === 'api_connection_failed') {
        setError('A network connection error occurred. Please try again.');
      } else {
        setError('Authentication is required to access your account.');
      }
    }
  }, [searchParams]);

  // Main login submit handler — uses NextAuth credentials provider
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) return setError('Please fill in all fields.');

    setLoading(true);
    try {
      const res = (await signIn<'credentials'>('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/account'
      })) as SignInResponse | undefined;

      if (!res) {
        setError('Unable to complete sign-in. Please try again.');
        return;
      }

      if (res.error) {
        setError(res.error || 'Invalid email or password. Please try again.');
        return;
      }

      if (res.url) {
        try {
          const { trackLogin } = await import('@/lib/analytics');
          trackLogin('credentials');
        } catch (e) {
          console.error('Failed to track login event:', e);
        }
        try {
          window.sessionStorage.setItem('naazbook-auth-toast', JSON.stringify({ message: 'Welcome back! You are signed in.', type: 'success' }));
        } catch {
          // ignore session storage failures
        }
        window.location.href = res.url;
        return;
      }

      setError('Unexpected sign-in response.');
    } catch (err: unknown) {
      console.error(err);
      setError('Unable to reach the authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { trackLogin } = await import('@/lib/analytics');
      trackLogin('google');
    } catch (e) {
      console.error('Failed to track login event:', e);
    }
    try {
      window.sessionStorage.setItem('naazbook-auth-toast', JSON.stringify({ message: 'Welcome back! You are signed in.', type: 'success' }));
    } catch {
      // ignore session storage failures
    }
    await signIn('google', { callbackUrl: '/account' });
  };

  // Recovery form submit handler
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess(false);
    
    if (!recoveryEmail) {
      setRecoveryError('Please enter your email address.');
      return;
    }
    
    setRecoveryLoading(true);
    
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setRecoverySuccess(true);
        setRecoveryEmail('');
      } else {
        setRecoveryError(data.error || 'Failed to send recovery email. Please check the address.');
      }
    } catch (err: unknown) {
      console.error(err);
      setRecoveryError('A network error occurred. Please try again.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3 group outline-none">
          <BookOpen className="text-[var(--islamic-gold)] group-hover:scale-110 transition-transform duration-300" size={28} />
          <span className="font-headings font-bold text-2xl text-[var(--islamic-green)] tracking-wide">NAAZ BOOK DEPOT</span>
        </Link>
        <div className="gold-divider mx-auto mb-4"></div>
        <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)] mb-2 tracking-tight">
          {isRecoveryMode ? 'Reset Your Password' : 'Ahlan Wa Sahlan'}
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          {isRecoveryMode 
            ? 'Enter your registered email below and we will send you a password recovery link.'
            : 'Sign in to access your account dashboard, track orders, and view your spiritual wishlist.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isRecoveryMode ? (
          <motion.div
            key="login-pane"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 bg-red-50/80 border border-red-100 rounded-2xl p-4 text-sm text-red-600 animate-[fadeIn_0.3s_ease]">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(true)}
                    className="text-xs font-semibold text-[var(--islamic-gold-dark)] hover:text-[var(--islamic-gold)] transition-colors focus:underline outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-light)] active:scale-98 text-white rounded-xl py-6 font-bold shadow-lg shadow-[var(--islamic-green)]/15 transition-all text-[15px] flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 justify-center mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
              >
                Sign in with Google
              </button>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                New to Naaz Book Depot?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-[var(--islamic-gold-dark)] hover:text-[var(--islamic-gold)] transition-colors focus:underline outline-none"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="recovery-pane"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Password Recovery Form */}
            <form onSubmit={handleRecoverySubmit} className="space-y-5">
              {recoverySuccess && (
                <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-700 animate-[fadeIn_0.3s_ease]">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Check Your Email</p>
                    <p className="text-emerald-600/90 text-xs">If an account is associated with that email, a password reset link has been dispatched.</p>
                  </div>
                </div>
              )}

              {recoveryError && (
                <div className="flex items-start gap-3 bg-red-50/80 border border-red-100 rounded-2xl p-4 text-sm text-red-600 animate-[fadeIn_0.3s_ease]">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="recovery-email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="recovery-email"
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={recoveryLoading}
                className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-light)] text-white rounded-xl py-6 font-bold shadow-lg shadow-[var(--islamic-green)]/15 transition-all text-[15px] flex items-center justify-center gap-2 mt-4"
              >
                {recoveryLoading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Request Reset Link <Sparkles size={16} />
                  </>
                )}
              </Button>
              
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  setRecoveryError('');
                  setRecoverySuccess(false);
                }}
                className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors pt-2 focus:underline outline-none"
              >
                Back to Sign In
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 md:py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Spiritual Islamic Background Geometric Overlay */}
      <div className="islamic-pattern opacity-10 absolute inset-0 z-0"></div>

      {/* Decorative Gold Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--islamic-gold)]/5 blur-3xl -z-10 animate-[pulse_6s_infinite]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--islamic-green)]/5 blur-3xl -z-10 animate-[pulse_8s_infinite]"></div>

      {/* Main Container */}
      <div className="w-full max-w-lg relative">
        {/* Subtle Glassmorphism Inner Shadow Card */}
        <div className="glass-card glass-card-highlight bg-white/70 backdrop-blur-xl border border-white/40 p-8 md:p-12 shadow-2xl rounded-3xl relative overflow-hidden">
          {/* Top border glowing highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--islamic-green)] via-[var(--islamic-gold)] to-[var(--islamic-green)]"></div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-[var(--islamic-green)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Ahlan wa sahlan...</p>
            </div>
          }>
            <LoginFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
