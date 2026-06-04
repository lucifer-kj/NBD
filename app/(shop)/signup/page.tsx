"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, BookOpen, AlertTriangle, ShieldCheck, UserCheck, Library, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();

  // State variables
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto scroll/slide down to signup form on mobile
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      const timer = setTimeout(() => {
        const formElement = document.getElementById('signup-form-section');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        try {
          const { trackSignUp } = await import('@/lib/analytics');
          trackSignUp('shopify');
        } catch (e) {
          console.error('Failed to track signup event:', e);
        }
        // Unification auto-login: Sign in the user client-side via NextAuth!
        try {
          const loginRes = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/account'
          });

          if (loginRes?.error) {
            router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);
          } else {
            try {
              window.sessionStorage.setItem('naazbook-auth-toast', JSON.stringify({ message: 'Welcome to Naaz Book Depot! You are now logged in.', type: 'success' }));
            } catch {
              // ignore session storage failures
            }
            router.push('/account');
            router.refresh();
          }
        } catch (loginErr) {
          console.error('Auto-login failed after registration:', loginErr);
          router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);
        }
      } else {
        setError(data.error || 'Failed to create your account. Please try again.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('A network connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] text-white">
      {/* Left Panel */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-gradient-to-br from-[#042817] via-[#0b482a] to-[#042817] overflow-hidden">
        {/* Mobile Go Back Button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold hover:bg-white/20 transition-all duration-300 md:hidden"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

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
            Get Started with Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-white/80 text-lg font-light leading-relaxed font-sans"
          >
            Begin your journey of spiritual enlightenment. Explore, catalog, and enrich your library with sacred texts.
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
              <span className="text-[14px] font-semibold tracking-wide">Register Account</span>
              <span className="text-[11px] opacity-75">Create your secure user credentials</span>
            </div>
            <ShieldCheck className="ml-auto text-[#042817]/70" size={18} />
          </div>

          {/* Step 2: Inactive */}
          <div className="border border-white/10 bg-white/5 text-white/60 p-4 rounded-xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 text-xs font-bold shrink-0">
              2
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-wide">Set Up Profile</span>
              <span className="text-[11px] opacity-50">Provide delivery and billing settings</span>
            </div>
            <UserCheck className="ml-auto opacity-40" size={18} />
          </div>

          {/* Step 3: Inactive */}
          <div className="border border-white/10 bg-white/5 text-white/60 p-4 rounded-xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 text-xs font-bold shrink-0">
              3
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-wide">Access Dashboard</span>
              <span className="text-[11px] opacity-50">Manage orders, wishlist, and library</span>
            </div>
            <Library className="ml-auto opacity-40" size={18} />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div id="signup-form-section" className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-headings font-bold tracking-tight text-white">
              Sign Up Account
            </h2>
            <p className="text-sm text-gray-400 font-sans">
              Enter your details below to create your account and get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-sm text-red-400 animate-[fadeIn_0.3s_ease]">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-medium uppercase tracking-wider text-gray-500">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Zayd"
                    className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-xs font-medium uppercase tracking-wider text-gray-500">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Khan"
                    className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="zayd.khan@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-gray-500">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  minLength={8}
                  className="w-full pl-11 pr-4 py-3 bg-[#181818] border-[#222] focus:border-[#c19a4e] focus:ring-1 focus:ring-[#c19a4e]/20 text-white rounded-xl transition-all h-12 text-[15px] placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 h-12 text-[15px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Sign in redirect */}
          <div className="text-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-[#c19a4e] hover:text-[#e5c17d] transition-colors focus:underline outline-none"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
