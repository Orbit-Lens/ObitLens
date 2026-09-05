// web-backend/src/modules/jobs/job.controller.ts

import type { Request, Response, NextFunction } from 'express';
import * as jobService from './job.service.js';
import { timingSafeEqual } from '../../utils/tokenCompare.js';
import { env } from '../../config/env.js';
import { createAppError } from '../../utils/ownershipCheck.js';

const DEFAULT_LIMIT = 20;

export async function createJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await jobService.createRegistrationJob(req.body, req.user!.id);
    res.status(201).json({ success: true, data: { job } });
  } catch (err) {
    next(err);
  }
}

export async function listJobsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1));
    const limit = Math.min(100, Number(req.query['limit'] ?? DEFAULT_LIMIT));
    const projectId = req.query['projectId'] as string | undefined;
    const { jobs, total } = await jobService.listJobs(req.user!.id, projectId, page, limit);
    res.json({
      success: true,
      data: jobs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await jobService.getJob(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { job } });
  } catch (err) {
    next(err);
  }
}

export async function getJobMetricsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await jobService.getJobMetrics(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { metrics } });
  } catch (err) {
    next(err);
  }
}

export async function getJobArtifactsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const urls = await jobService.getJobArtifacts(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { artifacts: urls } });
  } catch (err) {
    next(err);
  }
}

/**
 * Internal callback — called by the Python processing service to push job updates.
 * Secured by X-Internal-Key header (timing-safe comparison).
 * Blueprint §7 — Processing service authenticated with INTERNAL_API_KEY.
 */
export async function jobCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const internalKey = req.headers['x-internal-key'] as string | undefined;
    if (!internalKey || !timingSafeEqual(internalKey, env.PROCESSING_SERVICE_API_KEY)) {
      return next(createAppError('Invalid internal API key', 401, 'UNAUTHORIZED'));
    }
    await jobService.handleJobUpdate(req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
