import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../utils/http.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing authorization token'));
  }

  try {
    const token = header.slice('Bearer '.length);
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
