'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, CalendarDays, CheckCircle2, Folder, Home, Inbox, LogOut, Plus, Tag } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import clsx from 'clsx';
import { clearToken } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Label, Project } from '@/types';
import { ThemeToggle } from './ThemeToggle';

export function NavigationSidebar({ projects, labels, onCreated }: { projects: Project[]; labels: Label[]; onCreated: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [labelName, setLabelName] = useState('');
  const [busy, setBusy] = useState(false);

  function logout() {
    clearToken();
    router.push('/login');
  }

  function NavItem({
  href,
  icon,
  active,
  label,
  color,
  count,
}: {
  href: string;
  icon?: ReactNode;
  active: boolean;
  label: string;
  color?: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-rose-50 text-brand-700 dark:bg-brand-600/20 dark:text-rose-300'
          : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900'
      )}
    >
      {icon || (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      <span className="min-w-0 flex-1 truncate">{label}</span>

      {typeof count === 'number' && (
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {count}
        </span>
      )}
    </Link>
  );
}

  async function createProject(event: FormEvent) {
    event.preventDefault();
    if (!projectName.trim()) return;
    setBusy(true);
    try {
      await api('/projects', { method: 'POST', body: JSON.stringify({ name: projectName.trim() }) });
      setProjectName('');
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  async function createLabel(event: FormEvent) {
    event.preventDefault();
    if (!labelName.trim()) return;
    setBusy(true);
    try {
      await api('/labels', { method: 'POST', body: JSON.stringify({ name: labelName.trim() }) });
      setLabelName('');
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6 flex items-center justify-between">
      <Link href="/dashboard" className="text-2xl font-black text-brand-600">
        TaskFlow
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>

      <nav className="space-y-1">
        <NavItem href="/dashboard" icon={<Home size={18} />} active={pathname === '/dashboard'} label="Dashboard" />
        <NavItem href="/dashboard/inbox" icon={<Inbox size={18} />} active={pathname === '/dashboard/inbox'} label="Inbox" />
        <NavItem href="/dashboard/today" icon={<CalendarDays size={18} />} active={pathname === '/dashboard/today'} label="Today" />
        <NavItem href="/dashboard/week" icon={<CalendarDays size={18} />} active={pathname === '/dashboard/week'} label="This week" />
        <NavItem href="/dashboard/upcoming" icon={<CalendarDays size={18} />} active={pathname === '/dashboard/upcoming'} label="Upcoming" />
        <NavItem href="/dashboard/completed" icon={<CheckCircle2 size={18} />} active={pathname === '/dashboard/completed'} label="Completed" />
      </nav>

      <div className="mt-8 flex-1 overflow-y-auto pr-1">
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-neutral-400">
          <Folder size={15} /> Projects
        </div>
        <div className="space-y-1">
          {projects.map((project) => (
            <NavItem
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              active={pathname === `/dashboard/projects/${project.id}`}
              label={project.name}
              color={project.color || '#ef4444'}
              count={project._count?.tasks}
            />
          ))}
        </div>
        <form onSubmit={createProject} className="mt-3 flex gap-2">
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="New project" />
          <button disabled={busy} className="rounded-xl bg-neutral-900 p-2 text-white hover:bg-neutral-700 disabled:opacity-60" aria-label="Create project">
            <Plus size={16} />
          </button>
        </form>

        <div className="mb-3 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-neutral-400">
          <Tag size={15} /> Labels
        </div>
        <div className="space-y-1">
          {labels.map((label) => (
            <NavItem
              key={label.id}
              href={`/dashboard/labels/${label.id}`}
              active={pathname === `/dashboard/labels/${label.id}`}
              label={`@${label.name}`}
              color={label.color || '#64748b'}
              count={label._count?.tasks}
            />
          ))}
        </div>
        <form onSubmit={createLabel} className="mt-3 flex gap-2">
          <input value={labelName} onChange={(event) => setLabelName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="New label" />
          <button disabled={busy} className="rounded-xl bg-neutral-900 p-2 text-white hover:bg-neutral-700 disabled:opacity-60" aria-label="Create label">
            <Plus size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
