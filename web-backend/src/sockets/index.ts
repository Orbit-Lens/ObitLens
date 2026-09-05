// web-backend/src/sockets/index.ts
// Socket.io server — JWT-authenticated rooms for real-time job progress.
// Blueprint §4 — JWT-guarded rooms; emits job:update events to the owning user's room.
// Blueprint §8 — Prefer Socket.io push over polling where possible.

import type { Server as HttpServer } from 'http';
import type { Server as SocketServer } from 'socket.io';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

let io: SocketServer;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Upgrade path — fallback to long-polling in restricted environments
    transports: ['websocket', 'polling'],
  });

  // JWT authentication middleware for all socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyAccessToken(token);
      // Attach userId to the socket instance for room routing
      socket.data['userId'] = payload.id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    const room = `user:${userId}`;

    socket.join(room);
    logger.debug('Socket connected', { userId, socketId: socket.id, room });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId, socketId: socket.id });
    });
  });

  logger.info('Socket.io server initialised');
  return io;
}

/**
 * Emit a job:update event to the owning user's room.
 * Called from job.service.ts after every status update.
 * Blueprint §4 — io.to(`user:${userId}`).emit('job:update', job)
 */
export function emitJobUpdate(userId: string, jobData: unknown): void {
  if (!io) {
    logger.warn('Socket server not initialised — cannot emit job:update');
    return;
  }
  io.to(`user:${userId}`).emit('job:update', jobData);
}
