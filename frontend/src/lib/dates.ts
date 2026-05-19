import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export function formatDueDate(date?: string | null) {
  if (!date) return '';
  const parsed = parseISO(date);
  if (isToday(parsed)) return 'Today';
  if (isTomorrow(parsed)) return 'Tomorrow';
  if (isYesterday(parsed)) return 'Yesterday';
  return format(parsed, 'MMM d, yyyy');
}

export function formatDateTime(date?: string | null) {
  if (!date) return '';
  return format(parseISO(date), 'MMM d, yyyy h:mm a');
}

export function dateInputToIso(value: string) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`).toISOString();
}

export function isoToDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function dateInputFromToday(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}
