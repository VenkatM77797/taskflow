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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
        Loading TaskFlow...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <NavigationSidebar
        projects={projects}
        labels={labels}
        onCreated={loadNavigationSidebarData}
      />

      <main className="h-screen flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}