"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
exports.emitJobUpdate = emitJobUpdate;
const socket_io_1 = require("socket.io");
const jwt_js_1 = require("../utils/jwt.js");
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
let ioInstance = null;
function initSocketIO(server) {
    const allowedOrigins = env_js_1.env.CORS_ORIGINS.split(',').map((s) => s.trim());
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });
    // JWT Authentication Middleware for WebSockets
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');
        if (!token) {
            return next(new Error('Authentication token required for WebSocket'));
        }
        try {
            const payload = (0, jwt_js_1.verifyAccessToken)(token);
            socket.user = payload;
            next();
        }
        catch (err) {
            next(new Error('Invalid WebSocket authentication token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        if (user?.userId) {
            socket.join(`user:${user.userId}`);
            logger_js_1.logger.debug(`Socket connected for user ${user.userId} (socketId: ${socket.id})`);
        }
        socket.on('join:job', (jobId) => {
            socket.join(`job:${jobId}`);
            logger_js_1.logger.debug(`Socket ${socket.id} joined room job:${jobId}`);
        });
        socket.on('leave:job', (jobId) => {
            socket.leave(`job:${jobId}`);
        });
        socket.on('disconnect', () => {
            logger_js_1.logger.debug(`Socket disconnected: ${socket.id}`);
        });
    });
    ioInstance = io;
    return io;
}
function getIO() {
    return ioInstance;
}
function emitJobUpdate(userId, jobId, data) {
    if (ioInstance) {
        ioInstance.to(`user:${userId}`).emit('job:update', data);
        ioInstance.to(`job:${jobId}`).emit('job:update', data);
    }
}
