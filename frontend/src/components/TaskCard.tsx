'use client';

import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Flag, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { api } from '@/lib/api';
import { formatDateTime, formatDueDate, isoToDateInput, dateInputToIso } from '@/lib/dates';
import type { Task } from '@/types';
import { CreateTaskForm } from './CreateTaskForm';

export function TaskCard({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState((task.children?.length || 0) > 0);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(isoToDateInput(task.dueDate));
  const [priority, setPriority] = useState(task.priority);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(isoToDateInput(task.dueDate));
    setPriority(task.priority);
  }, [task]);

  const subtasks = task.children || [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;

  async function toggleComplete(target: Task = task) {
    await api(`/tasks/${target.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !target.completed })
    });
    onChanged();
  }

  async function remove(target: Task = task) {
    await api(`/tasks/${target.id}`, { method: 'DELETE' });
    onChanged();
  }

  async function saveChanges(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setBusy(true);
    try {
      await api(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dateInputToIso(dueDate),
          priority
        })
      });
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleComplete()}
          className={clsx('mt-0.5 h-5 w-5 rounded-full border-2 transition', task.completed ? 'border-brand-600 bg-brand-600' : `priority-${task.priority}`)}
          aria-label="Toggle complete"
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={saveChanges} className="space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 px-3 py-2 font-semibold outline-none focus:border-brand-500"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-20 w-full resize-none rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                placeholder="Description or notes optional"
              />
              <div className="grid gap-2 md:grid-cols-3">
                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <select value={priority} onChange={(event) => setPriority(Number(event.target.value))} className="rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-500">
                  <option value={1}>P1 urgent</option>
                  <option value={2}>P2 important</option>
                  <option value={3}>P3 normal</option>
                  <option value={4}>P4 low</option>
                </select>
                <div className="flex gap-2">
                  <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                    <Save size={15} /> Save
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-2xl border border-neutral-200 px-3 py-2 text-neutral-500 hover:bg-neutral-50">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={clsx('font-semibold text-neutral-900', task.completed && 'text-neutral-400 line-through')}>{task.title}</p>
                  {task.description && <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-500">{task.description}</p>}
                </div>
                <div className="flex opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setEditing(true)} className="rounded-xl p-2 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-700" aria-label="Edit task">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove()} className="rounded-xl p-2 text-neutral-300 hover:bg-red-50 hover:text-red-600" aria-label="Delete task">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                {task.dueDate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">
                    <Calendar size={13} /> {formatDueDate(task.dueDate)}
                  </span>
                )}
                <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-1', `priority-${task.priority}`)}>
                  <Flag size={13} /> P{task.priority}
                </span>
                {task.project && <span className="rounded-full bg-rose-50 px-2 py-1 text-brand-700">#{task.project.name}</span>}
                {task.labels?.map(({ label }) => (
                  <span key={label.id} className="rounded-full bg-neutral-100 px-2 py-1">@{label.name}</span>
                ))}
                {subtasks.length > 0 && <span className="rounded-full bg-neutral-100 px-2 py-1">{completedSubtasks}/{subtasks.length} subtasks</span>}
                <span className="text-neutral-300">Updated {formatDateTime(task.updatedAt)}</span>
              </div>
            </>
          )}

          <div className="mt-4 border-t border-neutral-100 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSubtasks((value) => !value)}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-50"
              >
                {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Subtasks {subtasks.length ? `(${subtasks.length})` : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSubtask((value) => !value);
                  setShowSubtasks(true);
                }}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-rose-50"
              >
                <Plus size={14} /> Add subtask
              </button>
            </div>

            {showAddSubtask && (
              <CreateTaskForm
                compact
                defaultParentId={task.id}
                defaultProjectId={task.projectId || undefined}
                onCreated={() => {
                  setShowAddSubtask(false);
                  setShowSubtasks(true);
                  onChanged();
                }}
              />
            )}

            {showSubtasks && subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-2">
                    <button
                      onClick={() => toggleComplete(subtask)}
                      className={clsx('h-4 w-4 rounded-full border-2 transition', subtask.completed ? 'border-brand-600 bg-brand-600' : `priority-${subtask.priority}`)}
                      aria-label="Toggle subtask complete"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={clsx('truncate text-sm font-medium text-neutral-800', subtask.completed && 'text-neutral-400 line-through')}>{subtask.title}</p>
                      {subtask.dueDate && <p className="text-xs text-neutral-400">{formatDueDate(subtask.dueDate)}</p>}
                    </div>
                    <button onClick={() => remove(subtask)} className="rounded-lg p-1 text-neutral-300 hover:bg-red-50 hover:text-red-600" aria-label="Delete subtask">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
