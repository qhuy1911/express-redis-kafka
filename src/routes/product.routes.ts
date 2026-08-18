import { Router } from 'express';

import { Role } from '../generated/prisma/enums.js';

import { validate } from '../middlewares/validate.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

import {
  createProductSchema,
  getProductsQuerySchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

import {
  create,
  findAll,
  findOne,
  remove,
  update,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', validate(getProductsQuerySchema), findAll);

router.get('/:id', findOne);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN),
  validate(createProductSchema),
  create,
);

router.patch(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(updateProductSchema),
  update,
);

router.delete('/:id', protect, restrictTo(Role.ADMIN), remove);

export default router;
