// web-backend/src/modules/metrics/metrics.controller.ts
// Aggregate statistics endpoint for the metrics dashboard.

import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Job } from '../jobs/job.model.js';

export async function getMetricsSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = new Types.ObjectId(req.user!.id);
    const projectId = req.query['projectId']
      ? new Types.ObjectId(req.query['projectId'] as string)
      : undefined;

    const matchStage: Record<string, unknown> = { userId };
    if (projectId) matchStage['projectId'] = projectId;

    const [summary] = await Job.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          completedJobs: { $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] } },
          failedJobs: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          avgRmse: { $avg: '$metrics.rmse' },
          avgInlierRatio: { $avg: '$metrics.inlierRatio' },
          avgCoverageScore: { $avg: '$metrics.coverageScore' },
          avgProcessingTimeMs: { $avg: '$metrics.processingTimeMs' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary ?? {
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          avgRmse: null,
          avgInlierRatio: null,
          avgCoverageScore: null,
          avgProcessingTimeMs: null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
