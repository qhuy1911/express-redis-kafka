import { RequestHandler } from 'express';

import { prisma } from '../config/db.js';
import { Role } from '../generated/prisma/enums.js';
import { AppError } from '../utils/appError.js';
import { isTokenBlacklisted, verifyAccessToken } from '../utils/jwt.js';

export const protect: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('You are not logged in', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  // 1. Kiểm tra Token xem có nằm trong Redis Blacklist (đã logout) không
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return next(
      new AppError(
        'Your session has expired or token is revoked. Please log in again.',
        401,
      ),
    );
  }

  // 2. Verify Access Token
  const decoded = verifyAccessToken(token);

  // 3. Kiểm tra sự tồn tại của User trong Database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  req.user = user;

  next();
};

export const restrictTo = (...roles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};
