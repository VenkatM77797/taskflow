'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { Task, TaskView } from '@/types';
import { CreateTaskForm } from './CreateTaskForm';
import { TaskCard } from './TaskCard';

type Props = {
  title: string;
  subtitle?: string;
  view?: TaskView;
  projectId?: string;
  labelId?: string;
};

export function TaskBoardPage({
  title,
  subtitle,
  view,
  projectId,
  labelId,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [noDueDate, setNoDueDate] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (view) params.set('view', view);
    if (projectId) params.set('projectId', projectId);
    if (labelId) params.set('labelId', labelId);
    if (search.trim()) params.set('search', search.trim());
    if (priority) params.set('priority', priority);
    if (noDueDate) params.set('noDueDate', 'true');

    return params.toString();
  }, [view, projectId, labelId, search, priority, noDueDate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api<{ tasks: Task[] }>(`/tasks?${queryString}`);
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-neutral-950 dark:text-neutral-50">
              {title}
            </h1>

            {!loading && (
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-neutral-600 shadow-sm dark:bg-neutral-800 dark:text-neutral-200">
                {tasks.length}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="glass-input flex items-center gap-2 rounded-2xl px-3 py-2 shadow-sm">
            <Search size={16} className="text-neutral-400 dark:text-neutral-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 md:w-56 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Search title or notes"
            />
          </div>

          <div className="glass-input flex items-center gap-2 rounded-2xl px-3 py-2 shadow-sm">
            <Filter size={16} className="text-neutral-400 dark:text-neutral-500" />

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="bg-transparent text-sm text-neutral-900 outline-none dark:text-neutral-100"
            >
              <option value="">All priorities</option>
              <option value="1">P1 urgent</option>
              <option value="2">P2 important</option>
              <option value="3">P3 normal</option>
              <option value="4">P4 low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <label className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
          <input
            type="checkbox"
            checked={noDueDate}
            onChange={(event) => setNoDueDate(event.target.checked)}
          />
          No due date only
        </label>

        {(search || priority || noDueDate) && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setPriority('');
              setNoDueDate(false);
            }}
            className="rounded-2xl px-3 py-2 font-semibold text-brand-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Clear filters
          </button>
        )}
      </div>

      {view !== 'completed' && (
        <CreateTaskForm
          defaultProjectId={projectId}
          defaultLabelId={labelId}
          onCreated={loadTasks}
        />
      )}

      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              No tasks here
            </h2>

            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Add a task or change your filter.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onChanged={loadTasks} />
          ))
        )}
      </div>
    </section>
  );
}