import { Request, Response } from 'express';

import * as authService from '../services/auth.service.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { AppError } from '../utils/appError.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.register(req.body as RegisterInput);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginInput);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const me = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const result = await authService.refresh(refreshToken);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(' ')[1];

  if (!userId || !accessToken) {
    throw new AppError('Unable to process logout request', 400);
  }

  await authService.logout(userId, accessToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
