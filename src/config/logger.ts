import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'development'
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        )
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
