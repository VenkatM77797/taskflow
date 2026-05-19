import Link from 'next/link';
import { CalendarDays, CheckCircle2, FolderKanban, Layers3, Tag } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-orange-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-brand-600">TaskFlow</div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-white">
              Login
            </Link>
            <Link href="/register" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              Get started
            </Link>
          </div>
        </nav>

        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm">
              Full-stack Todoist-inspired productivity app
            </p>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-neutral-950 md:text-6xl">
              Organize tasks, projects, labels, subtasks, and deadlines in one clean dashboard.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              TaskFlow includes authentication, dashboard stats, task details, priorities, search, filters, recovery, weekly planning, projects, labels, and subtasks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-2xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-200 hover:bg-brand-700">
                Create account
              </Link>
              <Link href="/login" className="rounded-2xl bg-white px-6 py-3 font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50">
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-rose-100">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Today</h2>
                <p className="text-sm text-neutral-500">3 tasks due</p>
              </div>
              <CalendarDays className="text-brand-600" />
            </div>
            <div className="space-y-3">
              {[
                ['Finish API stats route', 'P1', '2 subtasks'],
                ['Design task card edit mode', 'P2', 'UI'],
                ['Plan recurring tasks feature', 'P3', 'Next improvement'],
              ].map(([title, priority, meta]) => (
                <div key={title} className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-4">
                  <CheckCircle2 className="text-neutral-300" />
                  <div className="flex-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-neutral-500">{meta}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-brand-600">{priority}</span>
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

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand-600">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-neutral-600">{text}</p>
    </div>
  );
}
