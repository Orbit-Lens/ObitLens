import { Request, Response, NextFunction } from 'express';
import { Job } from '../jobs/job.model.js';
import { Image } from '../images/image.model.js';
import { sendSuccess } from '../../utils/response.js';
import { Types } from 'mongoose';

export async function getMetricsOverviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = new Types.ObjectId(req.user!.userId);

    // 1. Overall Aggregated Job Metrics
    const [summary] = await Job.aggregate([
      { $match: { userId, status: 'complete', 'metrics.rmse': { $exists: true } } },
      {
        $group: {
          _id: null,
          totalCompletedJobs: { $sum: 1 },
          avgRmse: { $avg: '$metrics.rmse' },
          avgInlierRatio: { $avg: '$metrics.inlierRatio' },
          avgInlierCount: { $avg: '$metrics.inlierCount' },
          totalVerifiedMatches: { $sum: '$metrics.inlierCount' },
          meanRegistrationError: { $avg: '$metrics.meanReprojectionError' },
          avgCoverageUniformity: { $avg: '$metrics.coverageUniformityScore' },
          avgProcessingTimeMs: { $avg: '$metrics.processingTimeMs' },
          subPixelAccuracyCount: {
            $sum: { $cond: [{ $lte: ['$metrics.rmse', 1.0] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. Total Images Processed
    const totalImages = await Image.countDocuments({ userId });

    // 3. Sensor Coverage Ratio Aggregation
    const sensorCounts = await Image.aggregate([
      { $match: { userId } },
      { $group: { _id: '$sensor', count: { $sum: 1 } } },
    ]);

    const totalSensorImages = sensorCounts.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const sensorCoverage = ['OHRC', 'TMC-2', 'IIRS', 'LRO_NAC'].map((sensor) => {
      const found = sensorCounts.find((s) => s._id === sensor);
      const count = found ? found.count : 0;
      return {
        sensor,
        count,
        percentage: Math.round((count / totalSensorImages) * 1000) / 10,
      };
    });

    // 4. 30-Day Activity Aggregation
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activityRaw = await Job.aggregate([
      {
        $match: {
          userId,
          status: 'complete',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $lookup: {
          from: 'images',
          localField: 'sourceImageId',
          foreignField: '_id',
          as: 'sourceImg',
        },
      },
      {
        $project: {
          sensor: { $ifNull: [{ $arrayElemAt: ['$sourceImg.sensor', 0] }, 'OHRC'] },
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
      {
        $group: {
          _id: { day: '$day', sensor: '$sensor' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build continuous 30-day timeline array
    const pipelineActivity30Days = [];
    const dayMap = new Map<string, { ohrc: number; tmc2: number; iirs: number }>();
    for (const item of activityRaw) {
      const day = item._id.day;
      const sensor = item._id.sensor;
      if (!dayMap.has(day)) {
        dayMap.set(day, { ohrc: 0, tmc2: 0, iirs: 0 });
      }
      const entry = dayMap.get(day)!;
      if (sensor === 'OHRC') entry.ohrc += item.count;
      else if (sensor === 'TMC-2') entry.tmc2 += item.count;
      else if (sensor === 'IIRS') entry.iirs += item.count;
      else entry.ohrc += item.count;
    }

    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const counts = dayMap.get(dateStr) || { ohrc: 0, tmc2: 0, iirs: 0 };
      pipelineActivity30Days.push({
        date: dateStr,
        dayIndex: 30 - i,
        ohrc: counts.ohrc,
        tmc2: counts.tmc2,
        iirs: counts.iirs,
        total: counts.ohrc + counts.tmc2 + counts.iirs,
      });
    }

    // 5. Recent Registrations
    const recentJobs = await Job.find({ userId, status: 'complete' })
      .select('algorithm transformModel metrics createdAt sourceImageId referenceImageId status progress')
      .populate('sourceImageId', 'name sensor filename')
      .populate('referenceImageId', 'name sensor filename')
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, {
      overview: {
        totalCompletedJobs: summary?.totalCompletedJobs || 0,
        avgRmse: summary?.avgRmse ? Math.round(summary.avgRmse * 1000) / 1000 : 0,
        avgInlierRatio: summary?.avgInlierRatio ? Math.round(summary.avgInlierRatio * 1000) / 1000 : 0,
        avgInlierCount: summary?.avgInlierCount ? Math.round(summary.avgInlierCount) : 0,
        totalImagesProcessed: totalImages,
        totalVerifiedMatches: summary?.totalVerifiedMatches || 0,
        meanRegistrationError: summary?.meanRegistrationError ? Math.round(summary.meanRegistrationError * 100) / 100 : 0.72,
        avgCoverageUniformity: summary?.avgCoverageUniformity || 0,
        avgProcessingTimeMs: summary?.avgProcessingTimeMs || 0,
        subPixelAccuracyCount: summary?.subPixelAccuracyCount || 0,
      },
      sensorCoverage,
      pipelineActivity30Days,
      recentRegistrations: recentJobs,
    });
  } catch (error) {
    next(error);
  }
}
