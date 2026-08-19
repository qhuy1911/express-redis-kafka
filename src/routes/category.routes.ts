import { Router } from 'express';

import {
  create,
  findAll,
  findByIdOrSlug,
  update,
  remove,
} from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '../generated/prisma/enums.js';
import { validate } from '../middlewares/validate.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/category.schema.js';

const router = Router();

router.get('/', findAll);

router.get('/:idOrSlug', findByIdOrSlug);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN),
  validate(createCategorySchema),
  create,
);

router.patch(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(updateCategorySchema),
  update,
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(categoryIdSchema),
  remove,
);

export default router;
