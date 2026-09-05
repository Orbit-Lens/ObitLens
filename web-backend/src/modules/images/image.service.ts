// web-backend/src/modules/images/image.service.ts
// Image upload lifecycle management.
// Blueprint §4 — Large-Image Upload Pattern (presigned S3 URLs).

import crypto from 'crypto';
import { Types } from 'mongoose';
import { Image, type IImage } from './image.model.js';
import { assertOwnership, createAppError } from '../../utils/ownershipCheck.js';
import {
  generatePresignedPutUrl,
  generatePresignedGetUrl,
  deleteObject,
} from '../../config/storage.js';
import { env } from '../../config/env.js';
import type { UploadUrlInput, ConfirmUploadInput } from './image.schema.js';
import * as processingClient from '../../services/processingClient.service.js';

/**
 * Step 1 — Request a presigned upload URL.
 * Creates an Image record with status 'pending_upload' and returns a
 * short-lived presigned PUT URL for the client to upload directly to S3.
 */
export async function requestUploadUrl(
  input: UploadUrlInput,
  userId: string
): Promise<{ image: IImage; uploadUrl: string }> {
  const key = `users/${userId}/images/${crypto.randomUUID()}/${input.filename}`;
  const storageUri = `s3://${env.S3_BUCKET}/${key}`;

  const image = await Image.create({
    userId: new Types.ObjectId(userId),
    ...(input.projectId ? { projectId: new Types.ObjectId(input.projectId) } : {}),
    filename: input.filename,
    contentType: input.contentType,
    storageUri,
    storageKey: key,
    status: 'pending_upload',
    sensor: input.sensor ?? 'other',
    ...(input.sunAzimuth !== undefined ? { sunAzimuth: input.sunAzimuth } : {}),
    ...(input.sunElevation !== undefined ? { sunElevation: input.sunElevation } : {}),
    ...(input.resolutionMPP !== undefined ? { resolutionMPP: input.resolutionMPP } : {}),
    ...(input.sizeBytes !== undefined ? { sizeBytes: input.sizeBytes } : {}),
  });

  // Presigned PUT URL — 1 hour, scoped to this exact object key
  const uploadUrl = await generatePresignedPutUrl(key, input.contentType, 3600);

  return { image, uploadUrl };
}

/**
 * Step 2 — Confirm upload complete.
 * Flips image status to 'metadata_extracting' and triggers a lightweight
 * metadata-extraction job in the processing service.
 */
export async function confirmUpload(
  imageId: string,
  userId: string,
  input: ConfirmUploadInput
): Promise<IImage> {
  const image = await assertOwnership(Image, imageId, userId);

  if (image.status !== 'pending_upload') {
    throw createAppError(
      'Image is not in pending_upload state',
      409,
      'CONFLICT'
    );
  }

  await Image.updateOne(
    { _id: image._id },
    {
      status: 'metadata_extracting',
      uploadedAt: new Date(),
      checksumSha256: input.checksumSha256,
      sizeBytes: input.sizeBytes ?? image.sizeBytes,
      sensor: input.sensor ?? image.sensor,
      sunAzimuth: input.sunAzimuth ?? image.sunAzimuth,
      sunElevation: input.sunElevation ?? image.sunElevation,
      resolutionMPP: input.resolutionMPP ?? image.resolutionMPP,
    }
  );

  // Kick off metadata extraction asynchronously — don't block the response
  processingClient
    .extractImageMetadata({ imageId: image._id.toString(), storageUri: image.storageUri })
    .catch((err: unknown) => {
      // Non-fatal — image can still be used with user-supplied metadata
      console.error('Metadata extraction failed for image', imageId, err);
    });

  const updated = await Image.findById(image._id);
  if (!updated) throw createAppError('Image not found after update', 404, 'NOT_FOUND');
  return updated;
}

export async function listImages(
  userId: string,
  projectId: string | undefined,
  page = 1,
  limit = 20
): Promise<{ images: IImage[]; total: number }> {
  const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (projectId) query['projectId'] = new Types.ObjectId(projectId);

  const [images, total] = await Promise.all([
    Image.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Image.countDocuments(query),
  ]);

  return { images, total };
}

export async function getImage(imageId: string, userId: string): Promise<IImage> {
  return assertOwnership(Image, imageId, userId);
}

export async function getImageDownloadUrl(imageId: string, userId: string): Promise<string> {
  const image = await assertOwnership(Image, imageId, userId);
  return generatePresignedGetUrl(image.storageKey, 3600);
}

export async function deleteImage(imageId: string, userId: string): Promise<void> {
  const image = await assertOwnership(Image, imageId, userId);
  // Mark deleted in DB first, then async delete from S3
  await Image.deleteOne({ _id: image._id });
  // Best-effort delete from storage (don't block on it)
  deleteObject(image.storageKey).catch((err: unknown) =>
    console.error('Failed to delete S3 object', image.storageKey, err)
  );
}
