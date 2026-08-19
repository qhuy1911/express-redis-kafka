import { Request, Response } from 'express';

import * as categoryService from '../services/category.service.js';

export const create = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
};

export const findAll = async (_req: Request, res: Response): Promise<void> => {
  const categories = await categoryService.findAll();

  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
};

export const findByIdOrSlug = async (
  req: Request<{ idOrSlug: string }>,
  res: Response,
): Promise<void> => {
  const category = await categoryService.findByIdOrSlug(req.params.idOrSlug);

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
};

export const update = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const category = await categoryService.update(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
};

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  await categoryService.remove(req.params.id);

  res.status(204).send();
};
