'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Folder, Inbox, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';

const defaultStats: DashboardStats = {
  openTotal: 0,
  inbox: 0,
  today: 0,
  week: 0,
  completed: 0,
  completedThisWeek: 0,
  highPriority: 0,
  noDueDate: 0,
  totalProjects: 0,
  totalLabels: 0
};

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await api<{ stats: DashboardStats }>('/stats');
      setStats(data.stats);
      setLoading(false);
    }

    loadStats().catch(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Overview</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-neutral-950">Task dashboard</h1>
        <p className="mt-2 text-neutral-500">A quick view of what needs attention, what is planned, and what is already done.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/dashboard/inbox" icon={<Inbox />} title="Inbox" value={stats.inbox} description="Unorganized open tasks" loading={loading} />
        <StatCard href="/dashboard/today" icon={<CalendarDays />} title="Today" value={stats.today} description="Due before tomorrow" loading={loading} />
        <StatCard href="/dashboard/week" icon={<CalendarDays />} title="This week" value={stats.week} description="Next 7 days" loading={loading} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SmallStat title="Open tasks" value={stats.openTotal} loading={loading} />
        <SmallStat title="High priority" value={stats.highPriority} loading={loading} />
        <SmallStat title="No due date" value={stats.noDueDate} loading={loading} />
        <SmallStat title="Completed this week" value={stats.completedThisWeek} loading={loading} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/completed" className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <CheckCircle2 className="text-brand-600" />
          <h2 className="mt-4 text-lg font-bold text-neutral-900">Completed archive</h2>
          <p className="mt-1 text-sm text-neutral-500">Review finished work and reopen tasks when needed.</p>
          <p className="mt-4 text-3xl font-black text-neutral-950">{loading ? '—' : stats.completed}</p>
        </Link>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Folder className="text-brand-600" />
          <h2 className="mt-4 text-lg font-bold text-neutral-900">Projects</h2>
          <p className="mt-1 text-sm text-neutral-500">Use projects for bigger areas like school, clients, or personal goals.</p>
          <p className="mt-4 text-3xl font-black text-neutral-950">{loading ? '—' : stats.totalProjects}</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Tag className="text-brand-600" />
          <h2 className="mt-4 text-lg font-bold text-neutral-900">Labels</h2>
          <p className="mt-1 text-sm text-neutral-500">Use labels for flexible context like urgent, study, backend, or errands.</p>
          <p className="mt-4 text-3xl font-black text-neutral-950">{loading ? '—' : stats.totalLabels}</p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ href, icon, title, value, description, loading, important = false }: { href: string; icon: React.ReactNode; title: string; value: number; description: string; loading: boolean; important?: boolean }) {
  return (
    <Link href={href} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${important ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-brand-600'}`}>{icon}</div>
      <p className="mt-5 text-sm font-semibold text-neutral-500">{title}</p>
      <p className="mt-1 text-4xl font-black text-neutral-950">{loading ? '—' : value}</p>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </Link>
  );
}

function SmallStat({ title, value, loading }: { title: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-neutral-950">{loading ? '—' : value}</p>
    </div>
  );
}
