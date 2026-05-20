'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationSidebar } from './NavigationSidebar';
import { api } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import type { Label, Project } from '@/types';

type AuthState = 'checking' | 'authorized' | 'unauthorized';

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>('checking');
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);

  const loadNavigationSidebarData = useCallback(async () => {
    const [projectData, labelData] = await Promise.all([
      api<{ projects: Project[] }>('/projects'),
      api<{ labels: Label[] }>('/labels'),
    ]);

    setProjects(projectData.projects);
    setLabels(labelData.labels);
  }, []);

  useEffect(() => {
    async function initializeDashboard() {
      const token = getToken();

      if (!token) {
        clearToken();
        setAuthState('unauthorized');
        router.replace('/login');
        return;
      }

      try {
        await api('/auth/me');
        await loadNavigationSidebarData();
        setAuthState('authorized');
      } catch (error) {
        console.error(error);
        clearToken();
        setAuthState('unauthorized');
        router.replace('/login');
      }
    }

    initializeDashboard();
  }, [router, loadNavigationSidebarData]);

  if (authState !== 'authorized') {
    return (
      <div className="aurora-bg flex min-h-screen items-center justify-center px-6 text-neutral-500 dark:text-neutral-400">
        <div className="glass-card rounded-3xl px-6 py-4 font-semibold">
          Loading TaskFlow...
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-bg flex min-h-screen text-neutral-900 dark:text-neutral-100">
      <div className="aurora-orb left-[-120px] top-[-120px] h-80 w-80 bg-brand-300/30 dark:bg-brand-500/20" />
      <div className="aurora-orb right-[-160px] top-32 h-96 w-96 bg-accent-500/20 dark:bg-accent-500/10" />
      <div className="aurora-orb bottom-[-180px] left-1/3 h-96 w-96 bg-sky-400/20 dark:bg-sky-500/10" />

      <NavigationSidebar
        projects={projects}
        labels={labels}
        onCreated={loadNavigationSidebarData}
      />

      <main className="relative z-10 h-screen flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}