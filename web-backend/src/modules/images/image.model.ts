// web-backend/src/modules/images/image.model.ts
// Image document — stores metadata for uploaded lunar raster files.
// Actual file bytes live in S3/MinIO, referenced by storageUri.
// Blueprint §4 — sensor, sunAzimuth, sunElevation, resolution, footprint, storageUri.

import mongoose, { type Document, Schema, type Types } from 'mongoose';

export type ImageStatus = 'pending_upload' | 'metadata_extracting' | 'ready' | 'error';
export type SensorType = 'OHRC' | 'TMC' | 'IIRS' | 'GeoTIFF' | 'other';

export interface IImage extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  filename: string;
  contentType: string;
  storageUri: string;           // e.g. s3://orbitlens-imagery/user123/image456.tif
  storageKey: string;           // S3 object key (without bucket prefix)
  status: ImageStatus;
  // Metadata (auto-extracted from PDS4 label or user-supplied)
  sensor: SensorType;
  sunAzimuth?: number;          // degrees
  sunElevation?: number;        // degrees
  resolutionMPP?: number;       // meters per pixel
  footprint?: {                 // GeoJSON polygon of image coverage
    type: 'Polygon';
    coordinates: number[][][];
  };
  checksumSha256?: string;
  sizeBytes?: number;
  errorMessage?: string;
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    filename: { type: String, required: true, trim: true },
    contentType: { type: String, required: true },
    storageUri: { type: String, required: true },
    storageKey: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending_upload', 'metadata_extracting', 'ready', 'error'],
      default: 'pending_upload',
      index: true,
    },
    sensor: {
      type: String,
      enum: ['OHRC', 'TMC', 'IIRS', 'GeoTIFF', 'other'],
      default: 'other',
    },
    sunAzimuth: { type: Number },
    sunElevation: { type: Number },
    resolutionMPP: { type: Number },
    footprint: {
      type: { type: String, enum: ['Polygon'] },
      coordinates: [[[Number]]],
    },
    checksumSha256: { type: String },
    sizeBytes: { type: Number },
    errorMessage: { type: String },
    uploadedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Compound indexes for efficient user-scoped queries
ImageSchema.index({ userId: 1, status: 1 });
ImageSchema.index({ userId: 1, projectId: 1, createdAt: -1 });

export const Image = mongoose.model<IImage>('Image', ImageSchema);
