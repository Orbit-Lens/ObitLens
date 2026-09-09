"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationQueue = exports.redisConnection = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const env_js_1 = require("./env.js");
const logger_js_1 = require("../utils/logger.js");
let redisConnection = null;
exports.redisConnection = redisConnection;
let registrationQueue = null;
exports.registrationQueue = registrationQueue;
let hasWarned = false;
try {
    exports.redisConnection = redisConnection = new ioredis_1.Redis(env_js_1.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 3000,
        retryStrategy(times) {
            if (times > 2) {
                if (!hasWarned) {
                    logger_js_1.logger.info('💡 Redis server not found locally. Operating in direct HTTP dispatch mode.');
                    hasWarned = true;
                }
                return null; // Stop retrying and do not flood the console
            }
            return 1000;
        },
    });
    redisConnection.on('error', (err) => {
        if (!hasWarned) {
            logger_js_1.logger.info(`💡 Redis notice (${err.code || err.message}). Operating in direct HTTP dispatch mode.`);
            hasWarned = true;
        }
    });
    redisConnection.on('connect', () => {
        logger_js_1.logger.info('✅ Redis connected successfully. BullMQ queue active.');
        if (!registrationQueue) {
            try {
                exports.registrationQueue = registrationQueue = new bullmq_1.Queue('orbitlens-registration', {
                    connection: redisConnection,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 2000,
                        },
                        removeOnComplete: 100,
                        removeOnFail: 200,
                    },
                });
            }
            catch (qErr) {
                logger_js_1.logger.warn('Failed to initialize BullMQ queue:', qErr.message);
            }
        }
    });
    // Attempt initial lazy connection without throwing uncaught rejection
    redisConnection.connect().catch(() => {
        // Handled by retryStrategy and error event handler
    });
}
catch (err) {
    logger_js_1.logger.info('💡 Redis not available. Operating in direct HTTP dispatch mode.');
}
