import { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { Role } from '../generated/prisma/enums.js';

import * as productService from '../services/product.service.js';
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from '../schemas/product.schema.js';

export const create = async (
  req: Request<unknown, unknown, CreateProductInput>,
  res: Response,
): Promise<void> => {
  const product = await productService.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const findAll = async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as GetProductsQuery;

  const filter: Prisma.ProductWhereInput = {};
  if (req.user?.role !== Role.ADMIN) {
    filter.isPublished = true;
  }

  const result = await productService.findAll(query, filter);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const findOne = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const product = await productService.findOne(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const update = async (
  req: Request<{ id: string }, unknown, UpdateProductInput>,
  res: Response,
): Promise<void> => {
  const product = await productService.update(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  await productService.remove(req.params.id);

  res.status(204).send();
};
