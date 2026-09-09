"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
exports.sendError = sendError;
function sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}
function sendPaginated(res, data, pagination, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
        pagination,
    });
}
function sendError(res, code, message, statusCode = 400, fields) {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(fields ? { fields } : {}),
        },
    });
}
