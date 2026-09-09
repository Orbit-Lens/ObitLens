"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.generatePresignedDownloadUrl = generatePresignedDownloadUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_js_1 = require("./env.js");
exports.s3Client = new client_s3_1.S3Client({
    region: env_js_1.env.S3_REGION,
    endpoint: env_js_1.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: env_js_1.env.S3_ACCESS_KEY_ID,
        secretAccessKey: env_js_1.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env_js_1.env.S3_FORCE_PATH_STYLE,
});
/**
 * Generate a short-lived presigned PUT URL for direct-to-S3 client uploads
 */
async function generatePresignedUploadUrl(key, contentType, expiresInSeconds = 900 // 15 minutes
) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: env_js_1.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    return await (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: expiresInSeconds });
}
/**
 * Generate a short-lived presigned GET URL for downloading/viewing artifacts
 */
async function generatePresignedDownloadUrl(key, expiresInSeconds = 3600 // 1 hour
) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: env_js_1.env.S3_BUCKET,
        Key: key,
    });
    return await (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: expiresInSeconds });
}
