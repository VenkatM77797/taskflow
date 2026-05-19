'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import type { User } from '@/types';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      try {
        await api<{ user: User }>('/auth/me');
        setLoading(false);
      } catch {
        clearToken();
        router.replace('/login');
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="rounded-3xl bg-white px-6 py-4 font-semibold shadow-sm">Loading TaskFlow...</div>
      </div>
    );
  }

  return <>{children}</>;
}
