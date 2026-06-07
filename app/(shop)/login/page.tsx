"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, SignInResponse } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle2, AlertTriangle, Sparkles, ShoppingCart, Library, ShieldCheck, ChevronLeft } from 'lucide-react';
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
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] text-white">
      {/* Left Panel */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#042817] via-[#0b482a] to-[#042817] overflow-hidden">

        {/* Subtle Islamic pattern overlay */}
        <div className="islamic-pattern opacity-10 absolute inset-0 z-0 mix-blend-overlay pointer-events-none"></div>

        {/* Decorative Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#c19a4e]/10 blur-3xl -z-10 animate-[pulse_8s_infinite]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#0b482a]/30 blur-3xl -z-10 animate-[pulse_10s_infinite]"></div>

        {/* Top: Logo & Title */}
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group outline-none">
            <BookOpen className="text-[#c19a4e] group-hover:scale-110 transition-transform duration-300" size={32} />
            <span className="font-headings font-bold text-2xl text-white tracking-wide">NAAZ BOOK DEPOT</span>
          </Link>
        </div>

        {/* Middle: Elegant typography */}
        <div className="relative z-10 my-12 md:my-0 space-y-6 max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-headings font-bold text-white leading-tight"
          >
            Ahlan Wa Sahlan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-white/80 text-lg font-light leading-relaxed font-sans"
          >
            Step back into your sanctuary of knowledge. Sync your heart and mind with our curated collection of spiritual literature.
          </motion.p>
        </div>

        {/* Bottom: Glassmorphic progress steps cards */}
        <div className="relative z-10 space-y-3.5 w-full max-w-sm mt-auto">
          {/* Step 1: Active */}
          <div className="bg-white text-[#042817] p-4 rounded-xl flex items-center gap-3.5 shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#042817] text-white text-xs font-bold shrink-0">
              1
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-wide">Authenticate Account</span>
              <span className="text-[11px] opacity-75">Sign in to your secure credentials</span>
            </div>
            <ShieldCheck className="ml-auto text-[#042817]/70" size={18} />
          </div>

          {/* Step 2: Inactive */}
          <div className="border border-white/10 bg-white/5 text-white/60 p-4 rounded-xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 text-xs font-bold shrink-0">
              2
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-wide">Sync Shopping Cart</span>
              <span className="text-[11px] opacity-50">Restore your items and bag</span>
            </div>
            <ShoppingCart className="ml-auto opacity-40" size={18} />
          </div>

          {/* Step 3: Inactive */}
          <div className="border border-white/10 bg-white/5 text-white/60 p-4 rounded-xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 text-xs font-bold shrink-0">
              3
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-wide">Access Library</span>
              <span className="text-[11px] opacity-50">Browse purchased texts instantly</span>
            </div>
            <Library className="ml-auto opacity-40" size={18} />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div id="login-form-section" className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 md:p-16 bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8 flex flex-col h-full justify-center">
          {/* Mobile Header: Back Button & Logo/Title */}
          <div className="w-full flex flex-col items-start md:hidden mb-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/';
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all duration-300 mb-6 cursor-pointer outline-none"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            
            <div className="flex flex-col items-center w-full gap-2 mb-4">
              <Link href="/" className="flex flex-col items-center gap-2 group outline-none">
                <div className="relative w-14 h-14 shrink-0">
                  <Image
                    src="/Images/logo.png"
                    alt="Naaz Book Depot Logo"
                    fill
                    sizes="56px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span
                  className="font-headings font-bold text-2xl tracking-wide text-center"
                  style={{ background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  Naaz Book Depot
                </span>
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-headings font-bold tracking-tight text-white">
              {isRecoveryMode ? 'Reset Password' : 'Sign In Account'}
            </h2>
            <p className="text-sm text-gray-400 font-sans">
              {isRecoveryMode 
                ? 'Enter your email below to receive a password recovery link.'
                : 'Welcome back. Enter your credentials to access your account.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isRecoveryMode ? (
              <motion.div
                key="login-form-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center px-4 py-3 bg-[#111] hover:bg-[#161616] text-white border border-[#222] hover:border-[#333] rounded-xl text-sm font-semibold transition-all duration-300 shadow-md group outline-none focus:ring-1 focus:ring-[#c19a4e]/50"
                >
                  <svg className="w-5 h-5 mr-3 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#1a1a1a]"></div>
                  <span className="flex-shrink mx-4 text-gray-600 text-xs font-semibold uppercase tracking-widest">or login with email</span>
                  <div className="flex-grow border-t border-[#1a1a1a]"></div>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-sm text-red-400 animate-[fadeIn_0.3s_ease]">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-gray-500">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-gray-500">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecoveryMode(true);
                          setError('');
                        }}
                        className="text-xs font-semibold text-[#c19a4e] hover:text-[#e5c17d] transition-colors focus:underline outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors touch-target"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 h-12 text-[15px]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-[#1a1a1a]">
                  <p className="text-sm text-gray-500">
                    New to Naaz Book Depot?{' '}
                    <Link
                      href="/signup"
                      className="font-bold text-[#c19a4e] hover:text-[#e5c17d] transition-colors focus:underline outline-none"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recovery-form-pane"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  {recoverySuccess && (
                    <div className="flex items-start gap-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 text-sm text-emerald-400 animate-[fadeIn_0.3s_ease]">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-0.5">Check Your Email</p>
                        <p className="text-emerald-500/80 text-xs">If an account is associated with that email, a password reset link has been dispatched.</p>
                      </div>
                    </div>
                  )}

                  {recoveryError && (
                    <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-sm text-red-400 animate-[fadeIn_0.3s_ease]">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <span>{recoveryError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="recovery-email" className="text-xs font-medium uppercase tracking-wider text-gray-500">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                      <Input
                        id="recovery-email"
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 h-12 text-[15px]"
                  >
                    {recoveryLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
                    className="w-full text-center text-sm font-semibold text-gray-500 hover:text-white transition-colors pt-2 focus:underline outline-none"
                  >
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0b482a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium font-sans">Ahlan wa sahlan...</p>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
