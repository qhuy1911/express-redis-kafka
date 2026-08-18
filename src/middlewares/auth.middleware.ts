import { RequestHandler } from 'express';
import { AppError } from '../utils/appError.js';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { Role } from '../generated/prisma/enums.js';

export const protect: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('You are not logged in', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }

  try {
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
  } catch (error) {
    next(error);
  }
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
