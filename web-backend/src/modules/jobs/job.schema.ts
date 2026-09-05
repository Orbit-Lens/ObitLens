// web-backend/src/modules/jobs/job.schema.ts

import { z } from 'zod';

const objectId = () => z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const CreateJobSchema = z.object({
  sourceImageId: objectId(),
  referenceImageId: objectId(),
  projectId: objectId().optional(),
  algorithm: z.enum(['classical', 'learned']).default('classical'),
  transformModel: z.enum(['affine', 'homography']).default('homography'),
  coverageTargetCells: z.number().int().min(4).max(256).default(64),
  // Optional advanced params
  ratioThreshold: z.number().min(0.5).max(1.0).default(0.75),
  ransacReprojThreshold: z.number().positive().default(3.0),
  maxKeypoints: z.number().int().positive().default(8000),
});

export const JobCallbackSchema = z.object({
  jobId: z.string(),
  status: z.enum(['queued','preprocessing','matching','estimating_transform','warping','scoring','complete','failed']),
  progress: z.number().min(0).max(100),
  metrics: z.object({
    rmse: z.number().optional(),
    inlierCount: z.number().optional(),
    inlierRatio: z.number().optional(),
    coverageScore: z.number().optional(),
    processingTimeMs: z.number().optional(),
    perStageTimingsMs: z.record(z.string(), z.number()).optional(),
  }).optional(),
  artifactUris: z.object({
    registeredImageUri: z.string().optional(),
    matchPointsUri: z.string().optional(),
    metricsReportUri: z.string().optional(),
  }).optional(),
  algorithmVersion: z.string().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type JobCallbackInput = z.infer<typeof JobCallbackSchema>;
