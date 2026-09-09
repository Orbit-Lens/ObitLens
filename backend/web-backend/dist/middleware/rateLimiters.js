"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.jobCreationLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const response_js_1 = require("../utils/response.js");
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return (0, response_js_1.sendError)(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later.', 429);
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 requests per 15 min for login/register/refresh
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return (0, response_js_1.sendError)(res, 'RATE_LIMIT_EXCEEDED', 'Too many authentication attempts, please try again in 15 minutes.', 429);
    },
});
exports.jobCreationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 jobs per 5 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return (0, response_js_1.sendError)(res, 'RATE_LIMIT_EXCEEDED', 'Job submission rate limit exceeded. Please wait before creating more registration jobs.', 429);
    },
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 upload URL requests per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return (0, response_js_1.sendError)(res, 'RATE_LIMIT_EXCEEDED', 'Upload request rate limit exceeded.', 429);
    },
});
