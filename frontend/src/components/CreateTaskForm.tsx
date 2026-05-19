'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { dateInputFromToday, dateInputToIso } from '@/lib/dates';
import type { Label, Project, Task } from '@/types';

type Props = {
  defaultProjectId?: string;
  defaultLabelId?: string;
  defaultParentId?: string;
  compact?: boolean;
  onCreated: () => void;
};

export function CreateTaskForm({ defaultProjectId, defaultLabelId, defaultParentId, compact = false, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(4);
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [labelId, setLabelId] = useState(defaultLabelId || '');
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setProjectId(defaultProjectId || '');
  }, [defaultProjectId]);

  useEffect(() => {
    setLabelId(defaultLabelId || '');
  }, [defaultLabelId]);

  useEffect(() => {
    if (compact) return;

    async function loadOptions() {
      const [projectData, labelData] = await Promise.all([
        api<{ projects: Project[] }>('/projects'),
        api<{ labels: Label[] }>('/labels')
      ]);
      setProjects(projectData.projects);
      setLabels(labelData.labels);
    }

    loadOptions().catch(() => setError('Could not load projects and labels'));
  }, [compact]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');

    try {
      await api<{ task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dateInputToIso(dueDate),
          priority,
          projectId: projectId || null,
          parentId: defaultParentId || null,
          labelIds: labelId ? [labelId] : []
        })
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(4);
      if (!defaultProjectId) setProjectId('');
      if (!defaultLabelId) setLabelId('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create task');
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="mt-3 flex gap-2 rounded-2xl bg-neutral-50 p-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          placeholder="Add a subtask"
        />
        <button disabled={loading} className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-700 disabled:opacity-60">
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Plus className="text-brand-600" size={20} />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="flex-1 border-none bg-transparent text-base outline-none"
          placeholder="Add a task"
        />
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="mt-4 min-h-20 w-full resize-none rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        placeholder="Description or notes optional"
      />

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        <div className="flex gap-2 lg:col-span-1">
          <button type="button" onClick={() => setDueDate(dateInputFromToday(0))} className="flex-1 rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
            Today
          </button>
          <button type="button" onClick={() => setDueDate(dateInputFromToday(1))} className="flex-1 rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
            Tomorrow
          </button>
        </div>

        <label className="relative">
          <CalendarDays size={15} className="pointer-events-none absolute left-3 top-2.5 text-neutral-400" />
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-2xl border border-neutral-200 px-9 py-2 text-sm outline-none focus:border-brand-500" />
        </label>

        <select value={priority} onChange={(event) => setPriority(Number(event.target.value))} className="rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
          <option value={1}>P1 urgent</option>
          <option value={2}>P2 important</option>
          <option value={3}>P3 normal</option>
          <option value={4}>P4 low</option>
        </select>

        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
          <option value="">Inbox</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>

        <select value={labelId} onChange={(event) => setLabelId(event.target.value)} className="rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
          <option value="">No label</option>
          {labels.map((label) => <option key={label.id} value={label.id}>@{label.name}</option>)}
        </select>
      </div>

      {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button disabled={loading} className="rounded-2xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Adding...' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
