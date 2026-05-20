'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { RequireAuth } from './RequireAuth';
import { NavigationSidebar } from './NavigationSidebar';
import { api } from '@/lib/api';
import type { Label, Project } from '@/types';

export function DashboardShell({ children }: { children: ReactNode }) {
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
    loadNavigationSidebarData();
  }, [loadNavigationSidebarData]);

  return (
    <RequireAuth>
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
    </RequireAuth>
  );
}