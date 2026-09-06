import http from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketIO } from './sockets/index.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  // 1. Create Express app and HTTP server
  const app = createApp();
  const httpServer = http.createServer(app);

  // 2. Initialize Socket.io
  initSocketIO(httpServer);

  // 3. Start listening immediately so port is available right away
  const server = httpServer.listen(env.PORT, () => {
    logger.info(`🚀 OrbitLens Web Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📡 Health Check: http://localhost:${env.PORT}/health`);
    logger.info(`🔍 Readiness Probe: http://localhost:${env.PORT}/ready`);
  });

  // 4. Connect to MongoDB (local, Atlas, or MongoMemoryServer fallback)
  connectDB().catch((err) => {
    logger.error('Database connection error:', err);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Database connection closed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
