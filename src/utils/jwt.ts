import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './appError.js';

export interface JwtPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

const JWT_SECRET: jwt.Secret =
  env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET is not defined');
  })();

const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1d';

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string' ||
    (decoded.role !== 'USER' && decoded.role !== 'ADMIN')
  ) {
    throw new AppError('Invalid token', 401);
  }

  return decoded as JwtPayload;
};
