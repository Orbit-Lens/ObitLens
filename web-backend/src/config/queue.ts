// web-backend/src/config/queue.ts
// BullMQ job queue backed by Redis.
// The Node API enqueues registration jobs; the Python Celery workers consume them.
// BullMQ is used here for job tracking, status, and future Node-side workers.

import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Shared Redis connection (reused across queue + socket.io)
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error('Redis error', { err }));

// Registration job queue — Node enqueues, Python workers consume via Celery.
// BullMQ queue is also used for monitoring and retry management.
export const processingQueue = new Queue('registration-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

export const processingQueueEvents = new QueueEvents('registration-jobs', {
  connection: new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null }),
});

export async function closeQueue(): Promise<void> {
  await processingQueue.close();
  await processingQueueEvents.close();
  await redisConnection.quit();
  logger.info('Queue connections closed');
}
