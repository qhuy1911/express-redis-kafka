import { Request, Response } from 'express';

import * as authService from '../services/auth.service.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

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
