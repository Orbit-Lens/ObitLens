"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./config/env.js");
const rateLimiters_js_1 = require("./middleware/rateLimiters.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const response_js_1 = require("./utils/response.js");
const queue_js_1 = require("./config/queue.js");
const processingClient_service_js_1 = require("./services/processingClient.service.js");
// Route imports
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./modules/users/user.routes.js"));
const project_routes_js_1 = __importDefault(require("./modules/projects/project.routes.js"));
const image_routes_js_1 = __importDefault(require("./modules/images/image.routes.js"));
const job_routes_js_1 = __importDefault(require("./modules/jobs/job.routes.js"));
const metrics_routes_js_1 = __importDefault(require("./modules/metrics/metrics.routes.js"));
const contact_routes_js_1 = __importDefault(require("./modules/contact/contact.routes.js"));
function createApp() {
    const app = (0, express_1.default)();
    // 1. Security headers
    app.use((0, helmet_1.default)());
    // 2. CORS configuration
    const allowedOrigins = env_js_1.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            }
            else {
                callback(new Error('CORS policy violation: Origin not allowed'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Key'],
    }));
    // 3. Cookie parser for HttpOnly refresh tokens
    app.use((0, cookie_parser_1.default)());
    // 4. Body parsing (5mb limit for metadata/JSON payloads, raw imagery uses direct S3 presigned PUT)
    app.use(express_1.default.json({ limit: '5mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
    // 5. NoSQL injection sanitization
    app.use((0, express_mongo_sanitize_1.default)());
    // 6. Development request logging
    if (env_js_1.env.NODE_ENV === 'development') {
        app.use((0, morgan_1.default)('dev'));
    }
    // 7. Liveness probe (always returns 200 if Express is running)
    app.get('/health', (req, res) => {
        return (0, response_js_1.sendSuccess)(res, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'orbitlens-web-backend',
            version: '1.0.0',
        });
    });
    // 8. Readiness probe (checks MongoDB, Redis, and Processing Service)
    app.get('/ready', async (req, res) => {
        const mongoState = mongoose_1.default.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const mongoStatus = mongoState === 1 ? 'connected' : mongoState === 2 ? 'connecting' : 'disconnected';
        const redisStatus = queue_js_1.redisConnection?.status === 'ready' ? 'connected' : 'standalone_direct_mode';
        const processingStatus = await (0, processingClient_service_js_1.getProcessingServiceHealth)();
        const isReady = mongoState === 1;
        const data = {
            status: isReady ? 'ready' : 'not_ready',
            mongodb: {
                status: mongoStatus,
                ...(mongoState !== 1
                    ? {
                        troubleshooting: 'MongoDB Atlas connection pending/rejected. Ensure your current IP is whitelisted in MongoDB Atlas (Network Access -> Add Current IP Address), or run local MongoDB.',
                    }
                    : {}),
            },
            redis: {
                status: redisStatus,
                mode: redisStatus === 'connected' ? 'bullmq_queue' : 'direct_http_dispatch',
            },
            processingService: processingStatus,
        };
        if (isReady) {
            return (0, response_js_1.sendSuccess)(res, data, 200);
        }
        else {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'DEPENDENCY_NOT_READY',
                    message: 'One or more required backend dependencies (MongoDB) are not connected yet.',
                },
                data,
            });
        }
    });
    // 9. Apply global rate limiter to API routes
    app.use('/api', rateLimiters_js_1.globalLimiter);
    // 10. API Route mounts
    app.use('/api/v1/auth', auth_routes_js_1.default);
    app.use('/api/v1/users', user_routes_js_1.default);
    app.use('/api/v1/projects', project_routes_js_1.default);
    app.use('/api/v1/images', image_routes_js_1.default);
    app.use('/api/v1/jobs', job_routes_js_1.default);
    app.use('/api/v1/metrics', metrics_routes_js_1.default);
    app.use('/api/v1/contact', contact_routes_js_1.default);
    // 11. Handle 404 for unknown endpoints
    app.use('*', (req, res) => {
        return (0, response_js_1.sendError)(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
    });
    // 12. Central error handler (always last)
    app.use(errorHandler_js_1.errorHandler);
    return app;
}
