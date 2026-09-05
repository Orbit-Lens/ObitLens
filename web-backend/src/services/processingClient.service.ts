// web-backend/src/services/processingClient.service.ts
// HTTP client for communicating with the Python processing service.
// All calls include the INTERNAL_API_KEY header.
// Blueprint §7 — processing service is internal-only; authenticated via INTERNAL_API_KEY.

import { env } from '../config/env.js';
import { createAppError } from '../utils/ownershipCheck.js';
import { logger } from '../utils/logger.js';

const BASE_URL = env.PROCESSING_SERVICE_URL;
const INTERNAL_KEY = env.PROCESSING_SERVICE_API_KEY;

async function internalFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': INTERNAL_KEY,
        ...(options?.headers ?? {}),
      },
    });
    return response;
  } catch (err) {
    logger.error('Processing service unreachable', { url, err });
    throw createAppError(
      'Processing service is currently unavailable',
      502,
      'PROCESSING_SERVICE_UNAVAILABLE'
    );
  }
}

export interface EnqueueJobPayload {
  jobId: string;
  sourceImageUri: string;
  referenceImageUri: string;
  algorithm: 'classical' | 'learned';
  transformModel: 'affine' | 'homography';
  coverageTargetCells: number;
  parameters: Record<string, unknown>;
}

/**
 * Enqueue a registration job to the Python processing service.
 */
export async function enqueueJob(payload: EnqueueJobPayload): Promise<void> {
  const response = await internalFetch('/internal/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error('Failed to enqueue job', { status: response.status, body });
    throw createAppError(
      `Processing service rejected job: ${response.status}`,
      502,
      'PROCESSING_SERVICE_UNAVAILABLE'
    );
  }
}

/**
 * Poll the processing service for a job's current status.
 */
export async function getJobStatus(jobId: string): Promise<Record<string, unknown>> {
  const response = await internalFetch(`/internal/jobs/${jobId}`);

  if (!response.ok) {
    throw createAppError(
      `Processing service returned ${response.status}`,
      502,
      'PROCESSING_SERVICE_UNAVAILABLE'
    );
  }

  return response.json() as Promise<Record<string, unknown>>;
}

/**
 * Trigger a lightweight metadata-extraction job for a newly uploaded image.
 * Fire-and-forget — caller should not await this in the request path.
 */
export async function extractImageMetadata(payload: {
  imageId: string;
  storageUri: string;
}): Promise<void> {
  const response = await internalFetch('/internal/metadata', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.warn('Metadata extraction request failed', {
      imageId: payload.imageId,
      status: response.status,
    });
  }
}
