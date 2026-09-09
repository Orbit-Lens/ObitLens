"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_js_1 = require("../utils/logger.js");
const response_js_1 = require("../utils/response.js");
function errorHandler(err, req, res, next) {
    logger_js_1.logger.error(`Unhandled error on ${req.method} ${req.url}:`, {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
    });
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
    const code = err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'An error occurred';
    return (0, response_js_1.sendError)(res, code, message, statusCode, err.fields);
}
