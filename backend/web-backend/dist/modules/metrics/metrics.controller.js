"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsOverviewHandler = getMetricsOverviewHandler;
const job_model_js_1 = require("../jobs/job.model.js");
const response_js_1 = require("../../utils/response.js");
const mongoose_1 = require("mongoose");
async function getMetricsOverviewHandler(req, res, next) {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.userId);
        const [summary] = await job_model_js_1.Job.aggregate([
            { $match: { userId, status: 'complete', 'metrics.rmse': { $exists: true } } },
            {
                $group: {
                    _id: null,
                    totalCompletedJobs: { $sum: 1 },
                    avgRmse: { $avg: '$metrics.rmse' },
                    avgInlierRatio: { $avg: '$metrics.inlierRatio' },
                    avgInlierCount: { $avg: '$metrics.inlierCount' },
                    avgCoverageUniformity: { $avg: '$metrics.coverageUniformityScore' },
                    avgProcessingTimeMs: { $avg: '$metrics.processingTimeMs' },
                    subPixelAccuracyCount: {
                        $sum: { $cond: [{ $lte: ['$metrics.rmse', 1.0] }, 1, 0] },
                    },
                },
            },
        ]);
        const recentJobs = await job_model_js_1.Job.find({ userId, status: 'complete' })
            .select('algorithm transformModel metrics createdAt sourceImageId referenceImageId')
            .populate('sourceImageId', 'name sensor')
            .populate('referenceImageId', 'name sensor')
            .sort({ createdAt: -1 })
            .limit(10);
        return (0, response_js_1.sendSuccess)(res, {
            overview: summary || {
                totalCompletedJobs: 0,
                avgRmse: 0,
                avgInlierRatio: 0,
                avgInlierCount: 0,
                avgCoverageUniformity: 0,
                avgProcessingTimeMs: 0,
                subPixelAccuracyCount: 0,
            },
            recentRegistrations: recentJobs,
        });
    }
    catch (error) {
        next(error);
    }
}
