"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Shopify sends the resetUrl parameter, or similar
  const resetUrl = searchParams.get('reset_url') || searchParams.get('url');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!resetUrl) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetUrl, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful</h2>
        <p className="text-gray-500">You have been logged in automatically. Redirecting to your account...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headings text-[var(--islamic-green)]">Reset Password</h1>
        <p className="text-gray-500 mt-2">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">New Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--islamic-gold)] focus:ring-1 focus:ring-[var(--islamic-gold)] outline-none transition-all"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <input 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--islamic-gold)] focus:ring-1 focus:ring-[var(--islamic-gold)] outline-none transition-all"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !resetUrl} 
          className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green)]/90 text-white rounded-xl py-6 text-lg"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

        {!resetUrl && !error && (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm border border-amber-200 mt-4">
            Warning: Reset URL is missing from the page link. Make sure you clicked the link exactly as it appeared in your email.
          </div>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-md">
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
