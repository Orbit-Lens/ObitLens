// web-backend/src/modules/metrics/metrics.routes.ts

import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { getMetricsSummaryHandler } from './metrics.controller.js';

const router = Router();

router.use(requireAuth as RequestHandler);

router.get('/summary', getMetricsSummaryHandler as RequestHandler);

export default router;
