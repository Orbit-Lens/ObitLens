"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('5000'),
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/orbitlens'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters').default('orbitlens_dev_jwt_access_secret_key_32_characters_long_super_secure'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters').default('orbitlens_dev_jwt_refresh_secret_key_32_characters_long_super_secure'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
    ENCRYPTION_KEY: zod_1.z.string().min(32).default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    S3_ENDPOINT: zod_1.z.string().default('https://s3.amazonaws.com'),
    S3_BUCKET: zod_1.z.string().default('orbitlens-imagery'),
    S3_ACCESS_KEY_ID: zod_1.z.string().default('test-access-key'),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().default('test-secret-key'),
    S3_REGION: zod_1.z.string().default('ap-south-1'),
    S3_FORCE_PATH_STYLE: zod_1.z.string().transform((v) => v === 'true').default('false'),
    PROCESSING_SERVICE_URL: zod_1.z.string().default('http://localhost:8000'),
    PROCESSING_SERVICE_API_KEY: zod_1.z.string().min(16).default('shared_internal_orbitlens_secret_key_123'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('noreply@orbitlens.app'),
    SENTRY_DSN: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
exports.env = parsed.data;
