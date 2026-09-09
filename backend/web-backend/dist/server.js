"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_js_1 = require("./app.js");
const db_js_1 = require("./config/db.js");
const index_js_1 = require("./sockets/index.js");
const env_js_1 = require("./config/env.js");
const logger_js_1 = require("./utils/logger.js");
async function bootstrap() {
    // 1. Create Express app and HTTP server
    const app = (0, app_js_1.createApp)();
    const httpServer = http_1.default.createServer(app);
    // 2. Initialize Socket.io
    (0, index_js_1.initSocketIO)(httpServer);
    // 3. Start listening immediately so port is available right away
    const server = httpServer.listen(env_js_1.env.PORT, () => {
        logger_js_1.logger.info(`🚀 OrbitLens Web Backend running in ${env_js_1.env.NODE_ENV} mode on port ${env_js_1.env.PORT}`);
        logger_js_1.logger.info(`📡 Health Check: http://localhost:${env_js_1.env.PORT}/health`);
        logger_js_1.logger.info(`🔍 Readiness Probe: http://localhost:${env_js_1.env.PORT}/ready`);
    });
    // 4. Connect to MongoDB (local, Atlas, or MongoMemoryServer fallback)
    (0, db_js_1.connectDB)().catch((err) => {
        logger_js_1.logger.error('Database connection error:', err);
    });
    // Graceful shutdown handling
    const shutdown = async (signal) => {
        logger_js_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
        server.close(async () => {
            logger_js_1.logger.info('HTTP server closed.');
            await (0, db_js_1.disconnectDB)();
            logger_js_1.logger.info('Database connection closed.');
            process.exit(0);
        });
        setTimeout(() => {
            logger_js_1.logger.error('Forced shutdown due to timeout');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap().catch((err) => {
    logger_js_1.logger.error('Fatal bootstrap error:', err);
    process.exit(1);
});
