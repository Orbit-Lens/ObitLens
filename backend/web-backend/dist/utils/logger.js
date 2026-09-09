"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_js_1 = require("../config/env.js");
const { combine, timestamp, printf, colorize, json } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        // Redact any accidental tokens/passwords
        const sanitized = JSON.parse(JSON.stringify(metadata, (key, value) => {
            if (/password|secret|token|authorization|apiKey/i.test(key)) {
                return '[REDACTED]';
            }
            return value;
        }));
        msg += ` ${JSON.stringify(sanitized)}`;
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: env_js_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), env_js_1.env.NODE_ENV === 'production' ? json() : combine(colorize(), customFormat)),
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
