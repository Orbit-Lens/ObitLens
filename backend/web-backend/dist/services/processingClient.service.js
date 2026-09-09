"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchProcessingJob = dispatchProcessingJob;
exports.triggerMetadataExtraction = triggerMetadataExtraction;
exports.getProcessingServiceHealth = getProcessingServiceHealth;
const axios_1 = __importDefault(require("axios"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const client = axios_1.default.create({
    baseURL: env_js_1.env.PROCESSING_SERVICE_URL,
    headers: {
        'X-Internal-Key': env_js_1.env.PROCESSING_SERVICE_API_KEY,
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 2 minutes timeout for large tasks
});
async function dispatchProcessingJob(payload) {
    try {
        const response = await client.post('/internal/jobs', payload);
        return response.status === 200 || response.status === 202;
    }
    catch (error) {
        logger_js_1.logger.error('Failed to dispatch job to processing service:', {
            message: error.message,
            url: `${env_js_1.env.PROCESSING_SERVICE_URL}/internal/jobs`,
            status: error.response?.status,
            data: error.response?.data,
        });
        return false;
    }
}
async function triggerMetadataExtraction(imageId, storageKey) {
    try {
        const response = await client.post('/internal/metadata/extract', {
            imageId,
            storageKey,
        });
        return response.data?.data || null;
    }
    catch (error) {
        logger_js_1.logger.warn('Metadata extraction call to processing service failed:', error.message);
        return null;
    }
}
async function getProcessingServiceHealth() {
    try {
        const response = await client.get('/health', { timeout: 3000 });
        return { status: 'healthy', details: response.data };
    }
    catch (error) {
        return { status: 'unreachable', details: error.message };
    }
}
