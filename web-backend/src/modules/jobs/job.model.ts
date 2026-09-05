// web-backend/src/modules/jobs/job.model.ts
// Registration job document — tracks the full lifecycle of a CV/ML registration run.
// Blueprint §1 — Job status values and reproducibility requirements.

import mongoose, { type Document, Schema, type Types } from 'mongoose';

export type JobStatus =
  | 'queued'
  | 'preprocessing'
  | 'matching'
  | 'estimating_transform'
  | 'warping'
  | 'scoring'
  | 'complete'
  | 'failed';

export type AlgorithmType = 'classical' | 'learned';
export type TransformModel = 'affine' | 'homography';

export interface JobMetrics {
  rmse?: number;             // Root mean square error (pixels)
  inlierCount?: number;
  inlierRatio?: number;      // 0–1
  coverageScore?: number;    // 0–1
  processingTimeMs?: number;
  perStageTimingsMs?: Record<string, number>;
}

export interface JobArtifactUris {
  registeredImageUri?: string;
  matchPointsUri?: string;  // GeoJSON
  metricsReportUri?: string;
}

export interface IJob extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  sourceImageId: Types.ObjectId;
  referenceImageId: Types.ObjectId;
  // Algorithm config (persisted for reproducibility)
  algorithm: AlgorithmType;
  transformModel: TransformModel;
  coverageTargetCells: number;
  algorithmVersion?: string;    // e.g. "SIFT-opencv-4.9.0" or "LightGlue-kornia-0.7.x"
  parameters?: Record<string, unknown>;   // Full params snapshot
  inputChecksums?: {
    source?: string;
    reference?: string;
  };
  // Lifecycle
  status: JobStatus;
  progress: number;             // 0–100
  metrics?: JobMetrics;
  artifactUris?: JobArtifactUris;
  error?: { code: string; message: string };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    sourceImageId: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    referenceImageId: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    algorithm: { type: String, enum: ['classical', 'learned'], default: 'classical' },
    transformModel: { type: String, enum: ['affine', 'homography'], default: 'homography' },
    coverageTargetCells: { type: Number, default: 64 },
    algorithmVersion: { type: String },
    parameters: { type: Schema.Types.Mixed },
    inputChecksums: {
      source: { type: String },
      reference: { type: String },
    },
    status: {
      type: String,
      enum: ['queued','preprocessing','matching','estimating_transform','warping','scoring','complete','failed'],
      default: 'queued',
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    metrics: {
      rmse: { type: Number },
      inlierCount: { type: Number },
      inlierRatio: { type: Number },
      coverageScore: { type: Number },
      processingTimeMs: { type: Number },
      perStageTimingsMs: { type: Schema.Types.Mixed },
    },
    artifactUris: {
      registeredImageUri: { type: String },
      matchPointsUri: { type: String },
      metricsReportUri: { type: String },
    },
    error: {
      code: { type: String },
      message: { type: String },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for efficient polling queries
JobSchema.index({ userId: 1, status: 1 });
JobSchema.index({ userId: 1, projectId: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
