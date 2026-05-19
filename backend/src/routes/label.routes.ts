import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

const labelSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().trim().max(32).optional()
});

router.get('/', async (req, res, next) => {
  try {
    const labels = await prisma.label.findMany({
      where: { userId: req.userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { tasks: true } } }
    });

    res.json({ labels });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = labelSchema.parse(req.body);

    const label = await prisma.label.create({
      data: {
        name: data.name,
        color: data.color || '#64748b',
        userId: req.userId!
      }
    });

    res.status(201).json({ label });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = labelSchema.partial().parse(req.body);
    const label = await prisma.label.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!label) throw new HttpError(404, 'Label not found');

    const updated = await prisma.label.update({
      where: { id: label.id },
      data
    });

    res.json({ label: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const label = await prisma.label.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!label) throw new HttpError(404, 'Label not found');

    await prisma.label.delete({ where: { id: label.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
