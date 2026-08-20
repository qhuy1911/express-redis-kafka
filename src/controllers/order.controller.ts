import { Request, Response } from 'express';

import * as orderService from '../services/order.service.js';
import { AppError } from '../utils/appError.js';

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const order = await orderService.createOrder(userId);

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
};
