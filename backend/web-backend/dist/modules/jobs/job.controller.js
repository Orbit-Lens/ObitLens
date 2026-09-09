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
exports.createJobHandler = createJobHandler;
exports.getJobsHandler = getJobsHandler;
exports.getJobByIdHandler = getJobByIdHandler;
exports.getJobMetricsHandler = getJobMetricsHandler;
exports.getJobArtifactsHandler = getJobArtifactsHandler;
exports.deleteJobHandler = deleteJobHandler;
exports.updateJobStatusInternalHandler = updateJobStatusInternalHandler;
const jobService = __importStar(require("./job.service.js"));
const response_js_1 = require("../../utils/response.js");
const tokenCompare_js_1 = require("../../utils/tokenCompare.js");
const env_js_1 = require("../../config/env.js");
async function createJobHandler(req, res, next) {
    try {
        const job = await jobService.createJob(req.user.userId, req.body);
        return (0, response_js_1.sendSuccess)(res, job, 201);
    }
    catch (error) {
        next(error);
    }
}
async function getJobsHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const projectId = req.query.projectId;
        const { jobs, total } = await jobService.getJobs(req.user.userId, {
            page,
            limit,
            status,
            projectId,
        });
        return (0, response_js_1.sendPaginated)(res, jobs, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        }, 200);
    }
    catch (error) {
        next(error);
    }
}
async function getJobByIdHandler(req, res, next) {
    try {
        const job = await jobService.getJobById(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, job);
    }
    catch (error) {
        next(error);
    }
}
async function getJobMetricsHandler(req, res, next) {
    try {
        const job = await jobService.getJobById(req.user.userId, req.params.id);
        if (!job.metrics) {
            return (0, response_js_1.sendError)(res, 'METRICS_NOT_READY', 'Job metrics are not available yet', 404);
        }
        return (0, response_js_1.sendSuccess)(res, job.metrics);
    }
    catch (error) {
        next(error);
    }
}
async function getJobArtifactsHandler(req, res, next) {
    try {
        const artifacts = await jobService.getJobArtifacts(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, artifacts);
    }
    catch (error) {
        next(error);
    }
}
async function deleteJobHandler(req, res, next) {
    try {
        await jobService.deleteJob(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, { message: 'Job deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Internal callback endpoint for Python processing service to report progress/results
 */
async function updateJobStatusInternalHandler(req, res, next) {
    try {
        const internalKey = req.headers['x-internal-key'];
        if (!internalKey || !(0, tokenCompare_js_1.timingSafeEqual)(internalKey, env_js_1.env.PROCESSING_SERVICE_API_KEY)) {
            return (0, response_js_1.sendError)(res, 'UNAUTHORIZED', 'Invalid internal service key', 401);
        }
        const job = await jobService.updateJobStatusInternal(req.params.id, req.body);
        if (!job) {
            return (0, response_js_1.sendError)(res, 'NOT_FOUND', 'Job not found', 404);
        }
        return (0, response_js_1.sendSuccess)(res, { message: 'Job status updated successfully' });
    }
    catch (error) {
        next(error);
    }
}
