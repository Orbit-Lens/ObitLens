// web-backend/src/config/storage.ts
// S3-compatible object storage client (AWS S3 or MinIO).
// Blueprint §4 — Presigned URLs for large raster uploads. Never proxy raw imagery
// through the Express body parser.

import {
  S3Client,
  HeadBucketCommand,
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  PutObjectCommand,
  GetObjectCommand,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// MinIO requires forcePathStyle: true; AWS S3 works with either.
export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

/**
 * Generate a short-lived presigned PUT URL so the client can upload
 * directly to object storage without proxying through Node.
 * Blueprint §4 — Large-Image Upload Pattern.
 */
export async function generatePresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const input: PutObjectCommandInput = {
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  };
  return getSignedUrl(s3Client, new PutObjectCommand(input), {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Generate a short-lived presigned GET URL for downloading artifacts.
 * Scope is single-object; never expose permanent/public URLs.
 */
export async function generatePresignedGetUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const input: GetObjectCommandInput = {
    Bucket: env.S3_BUCKET,
    Key: key,
  };
  return getSignedUrl(s3Client, new GetObjectCommand(input), {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Delete an object from the bucket (called when an image is deleted by its owner).
 */
export async function deleteObject(key: string): Promise<void> {
  const input: DeleteObjectCommandInput = {
    Bucket: env.S3_BUCKET,
    Key: key,
  };
  await s3Client.send(new DeleteObjectCommand(input));
}

/**
 * Check if the bucket is reachable — used by the /ready health check.
 */
export async function checkStorageReachable(): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    return true;
  } catch (err) {
    logger.error('Storage health check failed', { err });
    return false;
  }
}
