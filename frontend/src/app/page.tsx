import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Layers3,
  Tag,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="aurora-bg min-h-screen px-6 py-8 text-neutral-950 dark:text-neutral-50">
      <div className="aurora-orb left-[-160px] top-[-160px] h-96 w-96 bg-brand-300/30 dark:bg-brand-500/20" />
      <div className="aurora-orb right-[-140px] top-40 h-96 w-96 bg-accent-500/20 dark:bg-accent-500/10" />
      <div className="aurora-orb bottom-[-220px] left-1/3 h-[28rem] w-[28rem] bg-sky-400/20 dark:bg-sky-500/10" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16">
        <nav className="glass-panel flex items-center justify-between rounded-3xl px-5 py-4">
          <Link href="/" className="text-2xl font-black text-brand-600">
            TaskFlow
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-white/60 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700"
            >
              Get started
            </Link>
          </div>
        </nav>

        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="glass-pill mb-5 inline-flex rounded-full px-4 py-2 text-sm font-bold text-brand-700 dark:text-brand-300">
              Full-stack Todoist-inspired productivity app
            </p>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-6xl">
              Organize tasks, projects, labels, subtasks, and deadlines in one clean dashboard.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              TaskFlow includes authentication, dashboard stats, task details, priorities, search, filters, recovery, weekly planning, projects, labels, and subtasks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-brand-600 px-6 py-3 font-bold text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-700"
              >
                Create account
              </Link>

              <Link
                href="/login"
                className="glass-pill rounded-2xl px-6 py-3 font-bold text-neutral-900 transition hover:bg-white/80 dark:text-neutral-100 dark:hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-neutral-950 dark:text-neutral-50">
                  Today
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  3 tasks due
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <CalendarDays />
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['Finish API stats route', 'P1', '2 subtasks'],
                ['Design task card edit mode', 'P2', 'UI'],
                ['Plan recurring tasks feature', 'P3', 'Next improvement'],
              ].map(([title, priority, meta]) => (
                <div
                  key={title}
                  className="glass-input flex items-center gap-3 rounded-2xl px-4 py-4"
                >
                  <CheckCircle2 className="text-neutral-300 dark:text-neutral-500" />

                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {title}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {meta}
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Feature icon={<FolderKanban />} title="Projects" text="Group work by school, personal goals, clients, or teams." />
          <Feature icon={<CalendarDays />} title="Planning views" text="Inbox, Today, This Week, Upcoming, and Completed." />
          <Feature icon={<Tag />} title="Labels" text="Add flexible context like urgent, backend, design, or errands." />
          <Feature icon={<Layers3 />} title="Subtasks" text="Break bigger tasks into smaller steps without cluttering the main list." />
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        {icon}
      </div>

      <h3 className="text-lg font-black text-neutral-950 dark:text-neutral-50">
        {title}
      </h3>

      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        {text}
      </p>
    </div>
  );
}