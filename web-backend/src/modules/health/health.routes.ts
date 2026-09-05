// web-backend/src/modules/health/health.routes.ts

import { Router } from 'express';
import type { RequestHandler } from 'express-serve-static-core';
import { healthHandler, readyHandler } from './health.controller.js';

const router = Router();

// Not behind requireAuth or aggressive rate limiting
router.get('/health', healthHandler as unknown as RequestHandler);
router.get('/ready', readyHandler as unknown as RequestHandler);

export default router;
