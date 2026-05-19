import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../utils/jwt.js';
import { HttpError } from '../utils/http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new HttpError(409, 'Email is already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash
      },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const userWithPassword = await prisma.user.findUnique({ where: { email: data.email } });
    if (!userWithPassword) throw new HttpError(401, 'Invalid email or password');

    const isValid = await bcrypt.compare(data.password, userWithPassword.password);
    if (!isValid) throw new HttpError(401, 'Invalid email or password');

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      createdAt: userWithPassword.createdAt
    };

    const token = signToken(user.id);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
