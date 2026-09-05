// web-backend/src/modules/images/image.schema.ts
// Zod schemas for image upload endpoints.

import { z } from 'zod';

const ALLOWED_CONTENT_TYPES = [
  'image/tiff',
  'image/geotiff',
  'application/octet-stream', // PDS4 .img files
  'image/png',
  'image/jpeg',
] as const;

export const UploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine(
    (ct) => ALLOWED_CONTENT_TYPES.some((allowed) => ct.startsWith(allowed) || ct === allowed),
    { message: 'Unsupported file type. Supported: TIFF, GeoTIFF, PDS4 .img, PNG, JPEG' }
  ),
  projectId: z.string().optional(),
  // Optional user-supplied metadata (used if PDS4 parsing fails)
  sensor: z.enum(['OHRC', 'TMC', 'IIRS', 'GeoTIFF', 'other']).optional(),
  sunAzimuth: z.number().min(0).max(360).optional(),
  sunElevation: z.number().min(0).max(90).optional(),
  resolutionMPP: z.number().positive().optional(),
  sizeBytes: z.number().positive().optional(),
});

export const ConfirmUploadSchema = z.object({
  checksumSha256: z.string().length(64).optional(),
  sizeBytes: z.number().positive().optional(),
  // User can supply metadata at confirm time (after they've parsed the file locally)
  sensor: z.enum(['OHRC', 'TMC', 'IIRS', 'GeoTIFF', 'other']).optional(),
  sunAzimuth: z.number().min(0).max(360).optional(),
  sunElevation: z.number().min(0).max(90).optional(),
  resolutionMPP: z.number().positive().optional(),
});

export type UploadUrlInput = z.infer<typeof UploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;
