'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { User } from '@/types';
import { ThemeToggle } from './ThemeToggle';

type AuthResponse = {
  user: User;
  token: string;
};

const inputClass =
  'glass-input mt-1 w-full rounded-2xl px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-500 dark:text-neutral-100 dark:placeholder:text-neutral-500';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = mode === 'register' ? { name, email, password } : { email, password };

      const data = await api<AuthResponse>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: false,
      });

      setToken(data.token);
      router.replace('/dashboard/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aurora-bg flex min-h-screen items-center justify-center px-4 py-8 text-neutral-950 dark:text-neutral-50">
      <div className="aurora-orb left-[-160px] top-[-160px] h-96 w-96 bg-brand-300/30 dark:bg-brand-500/20" />
      <div className="aurora-orb right-[-140px] top-40 h-96 w-96 bg-accent-500/20 dark:bg-accent-500/10" />
      <div className="aurora-orb bottom-[-220px] left-1/3 h-[28rem] w-[28rem] bg-sky-400/20 dark:bg-sky-500/10" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-brand-600">
            TaskFlow
          </Link>

          <ThemeToggle />
        </div>

        <form onSubmit={onSubmit} className="glass-card rounded-[2rem] p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              {mode === 'login' ? 'Login' : 'Register'}
            </p>

            <h1 className="mt-2 text-3xl font-black text-neutral-950 dark:text-neutral-50">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>

            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              {mode === 'login' ? 'Login to manage your tasks.' : 'Start organizing your work today.'}
            </p>
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <label className="block">
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  Name
                </span>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="block">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                Email
              </span>

              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                Password
              </span>

              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="Minimum 6 characters"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-brand-600 px-4 py-3 font-black text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-300">
            {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}

            <Link
              className="font-black text-brand-600 dark:text-brand-300"
              href={mode === 'login' ? '/register' : '/login'}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}