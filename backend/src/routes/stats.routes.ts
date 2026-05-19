import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

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

router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { start: todayStart, end: todayEnd } = todayRange();
    const { start: weekStart, end: weekEnd } = weekRange();
    const openTopLevel = { userId, completed: false, parentId: null };

    const [
      openTotal,
      inbox,
      today,
      week,
      completed,
      completedThisWeek,
      highPriority,
      noDueDate,
      totalProjects,
      totalLabels
    ] = await Promise.all([
      prisma.task.count({ where: openTopLevel }),
      prisma.task.count({ where: { ...openTopLevel, projectId: null } }),
      prisma.task.count({ where: { ...openTopLevel, dueDate: { gte: todayStart, lt: todayEnd } } }),
      prisma.task.count({ where: { ...openTopLevel, dueDate: { lt: todayStart } } }),
      prisma.task.count({ where: { ...openTopLevel, dueDate: { gte: weekStart, lt: weekEnd } } }),
      prisma.task.count({ where: { userId, completed: true, parentId: null } }),
      prisma.task.count({ where: { userId, completed: true, completedAt: { gte: weekStart } } }),
      prisma.task.count({ where: { ...openTopLevel, priority: { in: [1, 2] } } }),
      prisma.task.count({ where: { ...openTopLevel, dueDate: null } }),
      prisma.project.count({ where: { userId } }),
      prisma.label.count({ where: { userId } })
    ]);

    res.json({
      stats: {
        openTotal,
        inbox,
        today,
        week,
        completed,
        completedThisWeek,
        highPriority,
        noDueDate,
        totalProjects,
        totalLabels
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
