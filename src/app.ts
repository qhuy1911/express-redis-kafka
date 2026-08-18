import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppError } from './utils/appError.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
  });
});

// Test Error Route
app.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('This is a test error!', 400));
});

// Async Error Test
app.get('/test-async-error', async (_req: Request, _res: Response) => {
  throw new AppError('This is an async test error!', 400);
});

// Handle Unknown Routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
