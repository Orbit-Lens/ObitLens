"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobStatusInternalSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    sourceImageId: zod_1.z.string().min(1, 'Source image ID is required'),
    referenceImageId: zod_1.z.string().min(1, 'Reference image ID is required'),
    projectId: zod_1.z.string().optional(),
    algorithm: zod_1.z.enum(['classical', 'learned']).default('classical'),
    transformModel: zod_1.z.enum(['affine', 'homography']).default('homography'),
    parameters: zod_1.z
        .object({
        coverageTargetCells: zod_1.z.number().int().min(4).max(256).default(64),
        ratioThreshold: zod_1.z.number().min(0.1).max(0.95).default(0.75),
        ransacReprojThreshold: zod_1.z.number().min(0.5).max(20.0).default(3.0),
        maxPyramidLevels: zod_1.z.number().int().min(1).max(6).default(4),
        illuminationCorrection: zod_1.z.boolean().default(true),
    })
        .optional(),
});
exports.updateJobStatusInternalSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'queued',
        'preprocessing',
        'matching',
        'estimating_transform',
        'warping',
        'scoring',
        'complete',
        'failed',
    ]),
    progress: zod_1.z.number().min(0).max(100).optional(),
    statusMessage: zod_1.z.string().optional(),
    metrics: zod_1.z
        .object({
        rmse: zod_1.z.number(),
        inlierCount: zod_1.z.number(),
        totalCandidateMatches: zod_1.z.number(),
        inlierRatio: zod_1.z.number(),
        meanReprojectionError: zod_1.z.number(),
        medianReprojectionError: zod_1.z.number(),
        coverageUniformityScore: zod_1.z.number(),
        processingTimeMs: zod_1.z.number(),
        sunAngleDeltaAzimuth: zod_1.z.number().optional(),
        sunAngleDeltaElevation: zod_1.z.number().optional(),
        confidenceWarning: zod_1.z.boolean().optional(),
    })
        .optional(),
    artifacts: zod_1.z
        .object({
        registeredImageStorageKey: zod_1.z.string().optional(),
        matchPointsStorageKey: zod_1.z.string().optional(),
        metricsReportStorageKey: zod_1.z.string().optional(),
        previewOverlayStorageKey: zod_1.z.string().optional(),
    })
        .optional(),
    errorMessage: zod_1.z.string().optional(),
    errorCode: zod_1.z.string().optional(),
});
