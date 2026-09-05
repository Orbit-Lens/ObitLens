// web-backend/src/modules/jobs/job.routes.ts

import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { CreateJobSchema, JobCallbackSchema } from './job.schema.js';
import {
  createJobHandler,
  listJobsHandler,
  getJobHandler,
  getJobMetricsHandler,
  getJobArtifactsHandler,
  jobCallbackHandler,
} from './job.controller.js';

const router = Router();

// Internal callback — NOT behind user auth (uses INTERNAL_API_KEY instead)
router.post('/callback', validate(JobCallbackSchema) as RequestHandler, jobCallbackHandler as RequestHandler);

// User-facing routes
router.use(requireAuth as RequestHandler);

router.post('/', validate(CreateJobSchema) as RequestHandler, createJobHandler as RequestHandler);
router.get('/', listJobsHandler as RequestHandler);
router.get('/:id', getJobHandler as RequestHandler);
router.get('/:id/metrics', getJobMetricsHandler as RequestHandler);
router.get('/:id/artifacts', getJobArtifactsHandler as RequestHandler);

export default router;
