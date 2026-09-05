// web-backend/src/utils/logger.ts
// Winston structured logger — no secrets, tokens, or PII in logs.
// Blueprint §7 — Logging: Winston + Sentry; no passwords/tokens/API keys in logs.

import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, json, colorize, simple, errors } = winston.format;

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  simple()
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports: [new winston.transports.Console()],
  // Do not exit on uncaught exceptions — let the process manager handle it
  exitOnError: false,
});
