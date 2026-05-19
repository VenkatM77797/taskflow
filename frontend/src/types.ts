export type User = {
  id: string;
  name?: string | null;
  email: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
};

export type Label = {
  id: string;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
};

export type TaskLabel = {
  taskId: string;
  labelId: string;
  label: Label;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null;
  priority: number;
  position: number;
  projectId?: string | null;
  parentId?: string | null;
  project?: Project | null;
  labels: TaskLabel[];
  children?: Task[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type TaskView = 'inbox' | 'today' | 'upcoming' | 'completed' | 'week';

export type DashboardStats = {
  openTotal: number;
  inbox: number;
  today: number;
  week: number;
  completed: number;
  completedThisWeek: number;
  highPriority: number;
  noDueDate: number;
  totalProjects: number;
  totalLabels: number;
};
