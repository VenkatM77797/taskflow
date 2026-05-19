import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(1).max(4).optional(),
  projectId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional()
});

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(1).max(4).optional(),
  projectId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  completed: z.boolean().optional(),
  labelIds: z.array(z.string().uuid()).optional()
});

const taskInclude = {
  project: true,
  labels: { include: { label: true } },
  children: {
    orderBy: [{ completed: 'asc' as const }, { createdAt: 'asc' as const }],
    include: {
      project: true,
      labels: { include: { label: true } }
    }
  }
};

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
}

function weekRange() {
  const { start } = todayRange();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

async function ensureProjectOwnership(projectId: string | null | undefined, userId: string) {
  if (!projectId) return;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new HttpError(404, 'Project not found');
}

async function ensureLabelsOwnership(labelIds: string[] | undefined, userId: string) {
  if (!labelIds?.length) return;
  const uniqueIds = [...new Set(labelIds)];
  const count = await prisma.label.count({ where: { id: { in: uniqueIds }, userId } });
  if (count !== uniqueIds.length) throw new HttpError(400, 'One or more labels are invalid');
}

async function ensureParentOwnership(parentId: string | null | undefined, userId: string, taskId?: string) {
  if (!parentId) return;
  if (taskId && parentId === taskId) throw new HttpError(400, 'A task cannot be its own subtask');

  const parent = await prisma.task.findFirst({ where: { id: parentId, userId } });
  if (!parent) throw new HttpError(404, 'Parent task not found');
}

router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const view = String(req.query.view || '');
    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
    const labelId = typeof req.query.labelId === 'string' ? req.query.labelId : undefined;
    const parentId = typeof req.query.parentId === 'string' ? req.query.parentId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const priority = typeof req.query.priority === 'string' ? Number(req.query.priority) : undefined;
    const noDueDate = req.query.noDueDate === 'true';

    const where: any = { userId };

    if (view === 'completed') {
      where.completed = true;
    } else {
      where.completed = false;
    }

    // Keep sub-tasks nested under their parent by default so the main list stays clean.
    where.parentId = parentId || null;

    if (view === 'inbox') where.projectId = null;

    if (view === 'today') {
      const { start, end } = todayRange();
      where.dueDate = { gte: start, lt: end };
    }

    if (view === 'upcoming') {
      const { end } = todayRange();
      where.dueDate = { gte: end };
    }

    if (view === 'week') {
      const { start, end } = weekRange();
      where.dueDate = { gte: start, lt: end };
    }

    if (projectId) where.projectId = projectId;
    if (labelId) where.labels = { some: { labelId } };
    if (priority && priority >= 1 && priority <= 4) where.priority = priority;
    if (noDueDate) where.dueDate = null;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
      include: taskInclude
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const data = taskCreateSchema.parse(req.body);

    await ensureProjectOwnership(data.projectId, userId);
    await ensureLabelsOwnership(data.labelIds, userId);
    await ensureParentOwnership(data.parentId, userId);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 4,
        projectId: data.projectId || null,
        parentId: data.parentId || null,
        userId,
        labels: data.labelIds?.length
          ? { create: [...new Set(data.labelIds)].map((labelId) => ({ labelId })) }
          : undefined
      },
      include: taskInclude
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const data = taskUpdateSchema.parse(req.body);

    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
    if (!task) throw new HttpError(404, 'Task not found');

    await ensureProjectOwnership(data.projectId, userId);
    await ensureLabelsOwnership(data.labelIds, userId);
    await ensureParentOwnership(data.parentId, userId, task.id);

    const updated = await prisma.$transaction(async (tx: any) => {
      if (data.labelIds) {
        await tx.taskLabel.deleteMany({ where: { taskId: task.id } });
        if (data.labelIds.length) {
          await tx.taskLabel.createMany({
            data: [...new Set(data.labelIds)].map((labelId) => ({ taskId: task.id, labelId }))
          });
        }
      }

      return tx.task.update({
        where: { id: task.id },
        data: {
          title: data.title,
          description: data.description === undefined ? undefined : data.description || null,
          dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null,
          priority: data.priority,
          projectId: data.projectId === undefined ? undefined : data.projectId || null,
          parentId: data.parentId === undefined ? undefined : data.parentId || null,
          completed: data.completed,
          completedAt: data.completed === undefined ? undefined : data.completed ? new Date() : null
        },
        include: taskInclude
      });
    });

    res.json({ task: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
    if (!task) throw new HttpError(404, 'Task not found');

    await prisma.task.delete({ where: { id: task.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
