import { Router } from 'express';

import {
  login,
  logout,
  me,
  refresh,
  register,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

// Public Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

// Protected Routes (Yêu cầu đăng nhập / Bearer Token)
router.get('/me', protect, me);
router.post('/logout', protect, logout);

export default router;
