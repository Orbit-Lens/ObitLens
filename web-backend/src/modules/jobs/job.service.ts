// web-backend/src/modules/jobs/job.service.ts
// Job orchestration — creates jobs, enqueues to processing service, handles callbacks.
// Blueprint §4 — Job Orchestration Pattern.

import { Types } from 'mongoose';
import { Job, type IJob, type JobMetrics, type JobArtifactUris } from './job.model.js';
import { Image } from '../images/image.model.js';
import { assertOwnership, createAppError } from '../../utils/ownershipCheck.js';
import * as processingClient from '../../services/processingClient.service.js';
import { generatePresignedGetUrl } from '../../config/storage.js';
import { emitJobUpdate } from '../../sockets/index.js';
import type { CreateJobInput, JobCallbackInput } from './job.schema.js';

/**
 * Create a registration job, persist it, and enqueue to the processing service.
 * Blueprint §4 — createRegistrationJob pattern.
 */
export async function createRegistrationJob(
  input: CreateJobInput,
  userId: string
): Promise<IJob> {
  // Verify both images belong to this user and are ready
  const [sourceImage, referenceImage] = await Promise.all([
    assertOwnership(Image, input.sourceImageId, userId),
    assertOwnership(Image, input.referenceImageId, userId),
  ]);

  if (sourceImage.status !== 'ready') {
    throw createAppError('Source image is not ready for processing', 400, 'VALIDATION_ERROR');
  }
  if (referenceImage.status !== 'ready') {
    throw createAppError('Reference image is not ready for processing', 400, 'VALIDATION_ERROR');
  }

  // Check for an already-running job on this pair
  const existingJob = await Job.findOne({
    userId: new Types.ObjectId(userId),
    sourceImageId: new Types.ObjectId(input.sourceImageId),
    referenceImageId: new Types.ObjectId(input.referenceImageId),
    status: { $in: ['queued', 'preprocessing', 'matching', 'estimating_transform', 'warping', 'scoring'] },
  });

  if (existingJob) {
    throw createAppError('A job is already running for this image pair', 409, 'CONFLICT');
  }

  // Persist the full parameters snapshot for reproducibility
  const parametersSnapshot = {
    ratioThreshold: input.ratioThreshold,
    ransacReprojThreshold: input.ransacReprojThreshold,
    maxKeypoints: input.maxKeypoints,
    coverageTargetCells: input.coverageTargetCells,
  };

  // Use conditional spreads for all optional fields to satisfy exactOptionalPropertyTypes
  const job = await Job.create({
    userId: new Types.ObjectId(userId),
    ...(input.projectId ? { projectId: new Types.ObjectId(input.projectId) } : {}),
    sourceImageId: new Types.ObjectId(input.sourceImageId),
    referenceImageId: new Types.ObjectId(input.referenceImageId),
    algorithm: input.algorithm,
    transformModel: input.transformModel,
    coverageTargetCells: input.coverageTargetCells,
    parameters: parametersSnapshot,
    // inputChecksums: spread only defined values
    inputChecksums: {
      ...(sourceImage.checksumSha256 ? { source: sourceImage.checksumSha256 } : {}),
      ...(referenceImage.checksumSha256 ? { reference: referenceImage.checksumSha256 } : {}),
    },
    status: 'queued',
    progress: 0,
  });

  const jobId = (job as IJob & { _id: Types.ObjectId })._id.toString();

  // Enqueue to the Python processing service
  await processingClient.enqueueJob({
    jobId,
    sourceImageUri: sourceImage.storageUri,
    referenceImageUri: referenceImage.storageUri,
    algorithm: input.algorithm,
    transformModel: input.transformModel,
    coverageTargetCells: input.coverageTargetCells,
    parameters: parametersSnapshot,
  });

  return job as IJob;
}

export async function getJob(jobId: string, userId: string): Promise<IJob> {
  return assertOwnership(Job, jobId, userId);
}

export async function listJobs(
  userId: string,
  projectId: string | undefined,
  page = 1,
  limit = 20
): Promise<{ jobs: IJob[]; total: number }> {
  const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (projectId) query['projectId'] = new Types.ObjectId(projectId);

  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(query),
  ]);
  return { jobs, total };
}

/**
 * Called by the processing-service callback route — updates job state and
 * pushes a Socket.io event to the owning user's room.
 */
export async function handleJobUpdate(payload: JobCallbackInput): Promise<void> {
  const job = await Job.findById(payload.jobId);
  if (!job) throw createAppError('Job not found', 404, 'NOT_FOUND');

  const update: Partial<IJob> = {
    status: payload.status,
    progress: payload.progress,
  };

  // Cast to concrete types — we guard with `if` so the value is defined
  if (payload.metrics) update.metrics = payload.metrics as JobMetrics;
  if (payload.artifactUris) update.artifactUris = payload.artifactUris as JobArtifactUris;
  if (payload.algorithmVersion) update.algorithmVersion = payload.algorithmVersion;
  if (payload.error) update.error = payload.error as { code: string; message: string };
  if (payload.status === 'preprocessing' && !job.startedAt) update.startedAt = new Date();
  if (payload.status === 'complete' || payload.status === 'failed') update.completedAt = new Date();

  await Job.updateOne({ _id: job._id }, { $set: update });
  const updatedJob = await Job.findById(job._id);

  // Push real-time update to the user's socket room
  emitJobUpdate(job.userId.toString(), updatedJob ?? job);
}

export async function getJobMetrics(jobId: string, userId: string): Promise<IJob['metrics']> {
  const job = await assertOwnership(Job, jobId, userId);
  if (!job.metrics) throw createAppError('Metrics not yet available', 404, 'NOT_FOUND');
  return job.metrics;
}

export async function getJobArtifacts(
  jobId: string,
  userId: string
): Promise<Record<string, string>> {
  const job = await assertOwnership(Job, jobId, userId);
  if (!job.artifactUris || job.status !== 'complete') {
    throw createAppError('Artifacts not yet available', 404, 'NOT_FOUND');
  }

  // Generate short-lived presigned GET URLs for each artifact
  const urls: Record<string, string> = {};
  for (const [name, uri] of Object.entries(job.artifactUris)) {
    if (uri) {
      const key = (uri as string).replace(/^s3:\/\/[^/]+\//, '');
      urls[name] = await generatePresignedGetUrl(key, 3600);
    }
  }
  return urls;
}
