'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import type { User } from '@/types';

type AuthResponse = {
  user: User;
  token: string;
};

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = mode === 'register' ? { name, email, password } : { email, password };
      const data = await api<AuthResponse>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: false
      });
      setToken(data.token);
      router.push('/dashboard/inbox');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-rose-50 to-orange-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-rose-100">
        <Link href="/" className="mb-8 block text-2xl font-black text-brand-600">TaskFlow</Link>
        <h1 className="text-3xl font-black text-neutral-950">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-2 text-neutral-500">
          {mode === 'login' ? 'Login to manage your tasks.' : 'Start organizing your work today.'}
        </p>

        <div className="mt-8 space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="text-sm font-semibold text-neutral-700">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-brand-500" placeholder="Your name" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-neutral-700">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-brand-500" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-neutral-700">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-brand-500" placeholder="Minimum 6 characters" />
          </label>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-brand-600 px-4 py-3 font-bold text-white shadow-lg shadow-rose-100 hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-600">
          {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
          <Link className="font-bold text-brand-600" href={mode === 'login' ? '/register' : '/login'}>
            {mode === 'login' ? 'Register' : 'Login'}
          </Link>
        </p>
      </form>
    </div>
  );
}
