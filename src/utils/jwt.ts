import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { AppError } from './appError.js';

export interface JwtPayload {
  userId: string;
  role?: string;
}

const JWT_ACCESS_SECRET: jwt.Secret =
  env.JWT_ACCESS_SECRET ??
  (() => {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  })();

const JWT_REFRESH_SECRET: jwt.Secret =
  env.JWT_REFRESH_SECRET ??
  (() => {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  })();

// Sign Access Token (Hạn ngắn)
export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

// Sign Refresh Token (Hạn dài)
export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

// Verify Access Token
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.userId !== 'string'
    ) {
      throw new AppError('Invalid token', 401);
    }

    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired token', 401);
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

// Check Token Blacklist trong Redis
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const exists = await redis.get(`blacklist:${token}`);
  return exists !== null;
};

// Đưa Access Token vào Redis Blacklist khi Logout
export const blacklistAccessToken = async (token: string) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded || !decoded.exp) return;

  const now = Math.floor(Date.now() / 1000);
  const ttl = decoded.exp - now;

  if (ttl > 0) {
    await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  }
};
