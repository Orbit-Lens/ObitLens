"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.updateJobStatusInternal = updateJobStatusInternal;
exports.getJobs = getJobs;
exports.getJobById = getJobById;
exports.getJobArtifacts = getJobArtifacts;
exports.deleteJob = deleteJob;
const mongoose_1 = require("mongoose");
const job_model_js_1 = require("./job.model.js");
const image_model_js_1 = require("../images/image.model.js");
const ownershipCheck_js_1 = require("../../utils/ownershipCheck.js");
const queue_js_1 = require("../../config/queue.js");
const processingClient_service_js_1 = require("../../services/processingClient.service.js");
const storage_js_1 = require("../../config/storage.js");
const index_js_1 = require("../../sockets/index.js");
const email_service_js_1 = require("../../services/email.service.js");
const user_model_js_1 = require("../users/user.model.js");
const logger_js_1 = require("../../utils/logger.js");
async function createJob(userId, input) {
    if (input.sourceImageId === input.referenceImageId) {
        const err = new Error('Source image and reference image must be different');
        err.statusCode = 400;
        err.code = 'INVALID_SENSOR_PAIR';
        throw err;
    }
    // Verify ownership of both images
    const sourceImage = await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, input.sourceImageId, userId);
    const referenceImage = await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, input.referenceImageId, userId);
    const job = await job_model_js_1.Job.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        projectId: input.projectId ? new mongoose_1.Types.ObjectId(input.projectId) : undefined,
        sourceImageId: sourceImage._id,
        referenceImageId: referenceImage._id,
        algorithm: input.algorithm,
        transformModel: input.transformModel,
        parameters: {
            coverageTargetCells: input.parameters?.coverageTargetCells ?? 64,
            ratioThreshold: input.parameters?.ratioThreshold ?? 0.75,
            ransacReprojThreshold: input.parameters?.ransacReprojThreshold ?? 3.0,
            maxPyramidLevels: input.parameters?.maxPyramidLevels ?? 4,
            illuminationCorrection: input.parameters?.illuminationCorrection ?? true,
        },
        status: 'queued',
        progress: 0,
        statusMessage: 'Job queued for processing',
    });
    const jobPayload = {
        jobId: job._id.toString(),
        sourceImageStorageKey: sourceImage.storageKey,
        referenceImageStorageKey: referenceImage.storageKey,
        sourceSensor: sourceImage.sensor,
        referenceSensor: referenceImage.sensor,
        sourceResolution: sourceImage.resolutionMetersPerPixel,
        referenceResolution: referenceImage.resolutionMetersPerPixel,
        algorithm: job.algorithm,
        transformModel: job.transformModel,
        parameters: job.parameters,
    };
    // 1. Add to BullMQ queue if active
    if (queue_js_1.registrationQueue) {
        try {
            await queue_js_1.registrationQueue.add('register-images', jobPayload, {
                jobId: job._id.toString(),
            });
        }
        catch (err) {
            logger_js_1.logger.warn('Failed to enqueue to BullMQ, falling back to direct dispatch:', err.message);
        }
    }
    // 2. Dispatch directly to Python processing service
    (0, processingClient_service_js_1.dispatchProcessingJob)(jobPayload).catch((err) => {
        logger_js_1.logger.error(`Direct dispatch failed for job ${job._id}:`, err);
    });
    (0, index_js_1.emitJobUpdate)(userId, job._id.toString(), {
        jobId: job._id.toString(),
        status: 'queued',
        progress: 0,
    });
    return job;
}
async function updateJobStatusInternal(jobId, input) {
    const job = await job_model_js_1.Job.findById(jobId);
    if (!job)
        return null;
    job.status = input.status;
    if (input.progress !== undefined)
        job.progress = input.progress;
    if (input.statusMessage)
        job.statusMessage = input.statusMessage;
    if (input.metrics)
        job.metrics = input.metrics;
    if (input.artifacts)
        job.artifacts = input.artifacts;
    if (input.errorMessage)
        job.errorMessage = input.errorMessage;
    if (input.errorCode)
        job.errorCode = input.errorCode;
    await job.save();
    (0, index_js_1.emitJobUpdate)(job.userId.toString(), job._id.toString(), {
        jobId: job._id.toString(),
        status: job.status,
        progress: job.progress,
        statusMessage: job.statusMessage,
        metrics: job.metrics,
        artifacts: job.artifacts,
        error: job.errorMessage ? { code: job.errorCode, message: job.errorMessage } : null,
    });
    if (job.status === 'complete' && job.metrics) {
        user_model_js_1.User.findById(job.userId).then((user) => {
            if (user && user.email) {
                (0, email_service_js_1.sendJobCompletionEmail)(user.email, job._id.toString(), job.metrics.rmse, job.metrics.inlierCount);
            }
        });
    }
    return job;
}
async function getJobs(userId, options) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const query = { userId: new mongoose_1.Types.ObjectId(userId) };
    if (options.status)
        query.status = options.status;
    if (options.projectId && mongoose_1.Types.ObjectId.isValid(options.projectId)) {
        query.projectId = new mongoose_1.Types.ObjectId(options.projectId);
    }
    const [jobs, total] = await Promise.all([
        job_model_js_1.Job.find(query)
            .populate('sourceImageId', 'name sensor resolutionMetersPerPixel format storageKey')
            .populate('referenceImageId', 'name sensor resolutionMetersPerPixel format storageKey')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        job_model_js_1.Job.countDocuments(query),
    ]);
    return { jobs, total };
}
async function getJobById(userId, jobId) {
    const job = await (0, ownershipCheck_js_1.assertOwnership)(job_model_js_1.Job, jobId, userId);
    await job.populate('sourceImageId', 'name filename sensor resolutionMetersPerPixel sunAzimuthDeg sunElevationDeg storageKey');
    await job.populate('referenceImageId', 'name filename sensor resolutionMetersPerPixel sunAzimuthDeg sunElevationDeg storageKey');
    return job;
}
async function getJobArtifacts(userId, jobId) {
    const job = await (0, ownershipCheck_js_1.assertOwnership)(job_model_js_1.Job, jobId, userId);
    const result = {};
    if (job.artifacts?.registeredImageStorageKey) {
        result.registeredImageUrl = await (0, storage_js_1.generatePresignedDownloadUrl)(job.artifacts.registeredImageStorageKey);
    }
    if (job.artifacts?.matchPointsStorageKey) {
        result.matchPointsUrl = await (0, storage_js_1.generatePresignedDownloadUrl)(job.artifacts.matchPointsStorageKey);
    }
    if (job.artifacts?.metricsReportStorageKey) {
        result.metricsReportUrl = await (0, storage_js_1.generatePresignedDownloadUrl)(job.artifacts.metricsReportStorageKey);
    }
    if (job.artifacts?.previewOverlayStorageKey) {
        result.previewOverlayUrl = await (0, storage_js_1.generatePresignedDownloadUrl)(job.artifacts.previewOverlayStorageKey);
    }
    return result;
}
async function deleteJob(userId, jobId) {
    await (0, ownershipCheck_js_1.assertOwnership)(job_model_js_1.Job, jobId, userId);
    await job_model_js_1.Job.findByIdAndDelete(jobId);
}
