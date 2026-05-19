import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function addDays(days: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  const demoEmail = 'demo@gmail.com';
  const demoPassword = '1234';

  // Reset only the demo account. Cascade rules remove its projects, labels, and tasks.
  await prisma.user.deleteMany({
    where: { email: demoEmail }
  });

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: demoEmail,
      password: passwordHash
    }
  });

  const [personalProject, schoolProject, workProject, fitnessProject] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Personal',
        color: '#22c55e',
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'School',
        color: '#3b82f6',
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Work',
        color: '#f97316',
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Fitness',
        color: '#a855f7',
        userId: user.id
      }
    })
  ]);

  const [urgentLabel, codingLabel, studyLabel, homeLabel, healthLabel] = await Promise.all([
    prisma.label.create({
      data: {
        name: 'urgent',
        color: '#ef4444',
        userId: user.id
      }
    }),
    prisma.label.create({
      data: {
        name: 'coding',
        color: '#06b6d4',
        userId: user.id
      }
    }),
    prisma.label.create({
      data: {
        name: 'study',
        color: '#6366f1',
        userId: user.id
      }
    }),
    prisma.label.create({
      data: {
        name: 'home',
        color: '#84cc16',
        userId: user.id
      }
    }),
    prisma.label.create({
      data: {
        name: 'health',
        color: '#ec4899',
        userId: user.id
      }
    })
  ]);

  const createTask = async (data: {
    title: string;
    description?: string;
    completed?: boolean;
    completedAt?: Date | null;
    dueDate?: Date | null;
    priority?: number;
    position?: number;
    projectId?: string | null;
    parentId?: string | null;
    labelIds?: string[];
  }) => {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        completed: data.completed ?? false,
        completedAt: data.completed ? data.completedAt ?? new Date() : null,
        dueDate: data.dueDate ?? null,
        priority: data.priority ?? 4,
        position: data.position ?? 0,
        projectId: data.projectId ?? null,
        parentId: data.parentId ?? null,
        userId: user.id,
        labels: data.labelIds?.length
          ? {
              create: [...new Set(data.labelIds)].map((labelId) => ({ labelId }))
            }
          : undefined
      }
    });
  };

  await createTask({
    title: 'Plan today\'s top 3 tasks',
    description: 'Choose the three most important things to finish today before adding smaller tasks.',
    dueDate: addDays(0, 9),
    priority: 2,
    position: 1,
    labelIds: [urgentLabel.id]
  });

  const appTask = await createTask({
    title: 'Improve TaskFlow dashboard',
    description: 'Polish the dashboard overview, check empty states, and make the layout easier to scan.',
    dueDate: addDays(0, 14),
    priority: 1,
    position: 2,
    projectId: workProject.id,
    labelIds: [codingLabel.id, urgentLabel.id]
  });

  await Promise.all([
    createTask({
      title: 'Add clean stats cards',
      description: 'Show total tasks, completed tasks, due today, and this week.',
      dueDate: addDays(0, 12),
      priority: 2,
      position: 1,
      projectId: workProject.id,
      parentId: appTask.id,
      labelIds: [codingLabel.id]
    }),
    createTask({
      title: 'Review sidebar labels',
      description: 'Make names clear for future improvements.',
      dueDate: addDays(1, 11),
      priority: 3,
      position: 2,
      projectId: workProject.id,
      parentId: appTask.id,
      labelIds: [codingLabel.id]
    })
  ]);

  await createTask({
    title: 'Study database relationships',
    description: 'Review User, Project, Task, Label, and TaskLabel relationships in Prisma.',
    dueDate: addDays(1, 18),
    priority: 2,
    position: 3,
    projectId: schoolProject.id,
    labelIds: [studyLabel.id]
  });

  await createTask({
    title: 'Prepare grocery list',
    description: 'Add basic items for the week and organize them before shopping.',
    dueDate: addDays(2, 10),
    priority: 4,
    position: 4,
    projectId: personalProject.id,
    labelIds: [homeLabel.id]
  });

  await createTask({
    title: 'Workout session',
    description: 'Simple training session: warm up, main workout, and stretching.',
    dueDate: addDays(3, 17),
    priority: 3,
    position: 5,
    projectId: fitnessProject.id,
    labelIds: [healthLabel.id]
  });

  await createTask({
    title: 'Refactor API route names',
    description: 'Keep backend routes readable and easy to extend later.',
    dueDate: addDays(5, 15),
    priority: 2,
    position: 6,
    projectId: workProject.id,
    labelIds: [codingLabel.id]
  });

  await createTask({
    title: 'Read 10 pages of a book',
    description: 'A small personal habit task with no fixed due date.',
    dueDate: null,
    priority: 4,
    position: 7,
    projectId: personalProject.id
  });

  await createTask({
    title: 'Completed demo task',
    description: 'This task is completed so the Completed page has example data.',
    completed: true,
    completedAt: addDays(0, 8),
    dueDate: addDays(0, 8),
    priority: 3,
    position: 8,
    projectId: personalProject.id,
    labelIds: [homeLabel.id]
  });

  console.log('Database seeded successfully.');
  console.log(`Demo login: ${demoEmail}`);
  console.log(`Demo password: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
