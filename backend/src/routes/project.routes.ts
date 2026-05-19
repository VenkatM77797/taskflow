import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  color: z.string().trim().max(32).optional()
});

router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { tasks: true } } }
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        color: data.color || '#ef4444',
        userId: req.userId!
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!project) throw new HttpError(404, 'Project not found');

    const updated = await prisma.project.update({
      where: { id: project.id },
      data
    });

    res.json({ project: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!project) throw new HttpError(404, 'Project not found');

    await prisma.project.delete({ where: { id: project.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
