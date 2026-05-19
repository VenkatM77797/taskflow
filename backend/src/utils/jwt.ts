import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET in environment');
}

const secret: jwt.Secret = jwtSecret;

export function signToken(userId: string) {
  return jwt.sign({ userId }, secret, { expiresIn });
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, secret) as unknown as { userId?: string };

  if (!payload.userId) {
    throw new Error('Invalid token payload');
  }

  return { userId: payload.userId };
}
