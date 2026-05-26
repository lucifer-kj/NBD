"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 md:py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Spiritual Islamic Background Geometric Overlay */}
      <div className="islamic-pattern opacity-10 absolute inset-0 z-0"></div>

      {/* Decorative Gold/Green Radial Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--islamic-gold)]/5 blur-3xl -z-10 animate-[pulse_6s_infinite]"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--islamic-green)]/5 blur-3xl -z-10 animate-[pulse_8s_infinite]"></div>

      {/* Main Container */}
      <div className="w-full max-w-lg relative">
        {/* Glassmorphism Inner Shadow Card */}
        <div className="glass-card glass-card-highlight bg-white/70 backdrop-blur-xl border border-white/40 p-8 md:p-12 shadow-2xl rounded-3xl relative overflow-hidden">
          {/* Top border glowing highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--islamic-green)] via-[var(--islamic-gold)] to-[var(--islamic-green)]"></div>

          <div className="relative z-10 w-full">
            {/* Brand Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-3 group outline-none">
                <BookOpen className="text-[var(--islamic-gold)] group-hover:scale-110 transition-transform duration-300" size={28} />
                <span className="font-headings font-bold text-2xl text-[var(--islamic-green)] tracking-wide">NAAZ BOOK DEPOT</span>
              </Link>
              <div className="gold-divider mx-auto mb-4"></div>
              <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)] mb-2 tracking-tight">
                Create Account
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Join our spiritual family and start cataloging your books and orders.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 bg-red-50/80 border border-red-100 rounded-2xl p-4 text-sm text-red-600 animate-[fadeIn_0.3s_ease]">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Fields Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-gray-500">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Zayd"
                      className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Khan"
                      className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
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
                    placeholder="zayd.khan@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={8}
                    className="w-full pl-11 pr-4 py-3 bg-[var(--islamic-cream)] border-gray-200/80 focus:border-[var(--islamic-gold)] focus:ring-[3px] focus:ring-[var(--islamic-gold)]/20 outline-none rounded-xl transition-all h-12 text-[15px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-light)] text-white rounded-xl py-6 font-bold shadow-lg shadow-[var(--islamic-green)]/15 transition-all text-[15px] flex items-center justify-center gap-2 mt-6 animate-[fadeIn_0.3s_ease]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Sign in redirect */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-bold text-[var(--islamic-gold-dark)] hover:text-[var(--islamic-gold)] transition-colors focus:underline outline-none"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
