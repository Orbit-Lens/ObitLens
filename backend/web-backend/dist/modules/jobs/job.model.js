"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const JobSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', index: true },
    sourceImageId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Image', required: true, index: true },
    referenceImageId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Image', required: true, index: true },
    algorithm: {
        type: String,
        enum: ['classical', 'learned'],
        default: 'classical',
    },
    transformModel: {
        type: String,
        enum: ['affine', 'homography'],
        default: 'homography',
    },
    parameters: {
        coverageTargetCells: { type: Number, default: 64 },
        ratioThreshold: { type: Number, default: 0.75 },
        ransacReprojThreshold: { type: Number, default: 3.0 },
        maxPyramidLevels: { type: Number, default: 4 },
        illuminationCorrection: { type: Boolean, default: true },
    },
    status: {
        type: String,
        enum: [
            'queued',
            'preprocessing',
            'matching',
            'estimating_transform',
            'warping',
            'scoring',
            'complete',
            'failed',
        ],
        default: 'queued',
        index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    statusMessage: { type: String },
    metrics: {
        rmse: Number,
        inlierCount: Number,
        totalCandidateMatches: Number,
        inlierRatio: Number,
        meanReprojectionError: Number,
        medianReprojectionError: Number,
        coverageUniformityScore: Number,
        processingTimeMs: Number,
        sunAngleDeltaAzimuth: Number,
        sunAngleDeltaElevation: Number,
        confidenceWarning: Boolean,
        ssim: Number,
        mutualInformation: Number,
        psnr: Number,
        transformationMatrix: mongoose_1.Schema.Types.Mixed,
        scaleRatio: String,
        azimuthRotationDeg: Number,
        translationDeltaX: Number,
        translationDeltaY: Number,
        shearDistortion: Number,
    },
    artifacts: {
        registeredImageStorageKey: String,
        registeredPreviewStorageKey: String,
        differenceMapStorageKey: String,
        matchPointsStorageKey: String,
        metricsReportStorageKey: String,
        previewOverlayStorageKey: String,
    },
    errorMessage: String,
    errorCode: String,
}, { timestamps: true });
exports.Job = mongoose_1.default.model('Job', JobSchema);
