import { Router } from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';

import { createOrderSchema } from '../schemas/order.schema.js';

import { createOrder } from '../controllers/order.controller.js';

const router = Router();

router.use(protect);

router.post('/', validate(createOrderSchema), createOrder);

export default router;
