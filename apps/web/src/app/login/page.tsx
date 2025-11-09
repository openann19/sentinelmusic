'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin_12345');
  const { login, error, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/admin');
      router.refresh();
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Login form"
      >
        <h1 className="text-2xl font-bold mb-6">Log in</h1>

        {error && (
          <div
            role="alert"
            className="p-4 bg-red-950 border border-red-800 rounded-xl text-red-200"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-sm mb-1 block">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            aria-required="true"
            required
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-sm mb-1 block">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            aria-required="true"
            required
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

