import bcrypt from 'bcryptjs';

import { prisma } from '../config/db.js';
import { redis } from '../config/redis.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { AppError } from '../utils/appError.js';
import {
  blacklistAccessToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 ngày (giây)

export const register = async (input: RegisterInput) => {
  const { email, password, name } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // 1. Tạo Access Token & Refresh Token
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  // 2. Lưu Refresh Token vào Redis
  await redis.set(
    `refresh_token:${user.id}`,
    refreshToken,
    'EX',
    REFRESH_TOKEN_TTL,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

export const refresh = async (refreshTokenInput: string) => {
  // 1. Verify chữ ký của Refresh Token
  const decoded = verifyRefreshToken(refreshTokenInput);

  // 2. Lấy Refresh Token lưu trong Redis để so sánh
  const savedRefreshToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (!savedRefreshToken || savedRefreshToken !== refreshTokenInput) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // 3. Token Rotation: Tạo mới bộ đôi Token
  const newAccessToken = signAccessToken({
    userId: decoded.userId,
    role: decoded.role,
  });
  const newRefreshToken = signRefreshToken({
    userId: decoded.userId,
    role: decoded.role,
  });

  // 4. Cập nhật Refresh Token mới vào Redis
  await redis.set(
    `refresh_token:${decoded.userId}`,
    newRefreshToken,
    'EX',
    REFRESH_TOKEN_TTL,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (userId: string, accessToken: string) => {
  // 1. Đưa Access Token vào Redis Blacklist
  await blacklistAccessToken(accessToken);

  // 2. Xóa Refresh Token khỏi Redis
  await redis.del(`refresh_token:${userId}`);
};
