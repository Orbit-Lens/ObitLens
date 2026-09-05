// web-backend/src/server.ts
// Entry point: connect to all dependencies, then start listening.
// Blueprint §2 — server.ts: DB connect → queue init → listen.

import { createServer } from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { closeQueue } from './config/queue.js';
import { initSocketServer } from './sockets/index.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start(): Promise<void> {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create Express app
  const app = createApp();

  // 3. Create HTTP server + attach Socket.io
  const httpServer = createServer(app);
  initSocketServer(httpServer);

  // 4. Start listening
  httpServer.listen(env.PORT, () => {
    logger.info(`OrbitLens API listening`, { port: env.PORT, env: env.NODE_ENV });
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received — shutting down gracefully`);

    httpServer.close(async () => {
      try {
        await Promise.all([disconnectDB(), closeQueue()]);
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown', { err });
        process.exit(1);
      }
    });

    // Force-kill if shutdown takes > 10s
    setTimeout(() => {
      logger.error('Graceful shutdown timeout — forcing exit');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err });
    process.exit(1);
  });
}

start().catch((err: unknown) => {
  console.error('Failed to start OrbitLens API:', err);
  process.exit(1);
});
