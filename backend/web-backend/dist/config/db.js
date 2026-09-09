"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const logger_js_1 = require("../utils/logger.js");
let mongodInstance = null;
async function connectDB() {
    mongoose_1.default.set('strictQuery', true);
    try {
        logger_js_1.logger.info('Connecting to MongoDB...');
        await mongoose_1.default.connect(env_js_1.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
        });
        logger_js_1.logger.info(`✅ MongoDB connected successfully to ${mongoose_1.default.connection.host}/${mongoose_1.default.connection.name}`);
        await initializeCollections();
    }
    catch (error) {
        logger_js_1.logger.warn(`⚠️ Could not connect to remote MongoDB Atlas (${error.message}).`);
        if (env_js_1.env.NODE_ENV !== 'production') {
            try {
                logger_js_1.logger.info('🚀 Starting local embedded MongoMemoryServer fallback for local development...');
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                mongodInstance = await MongoMemoryServer.create();
                const localUri = mongodInstance.getUri();
                await mongoose_1.default.connect(localUri);
                logger_js_1.logger.info(`✅ Local embedded MongoDB active and ready at ${localUri}`);
                await initializeCollections();
            }
            catch (memErr) {
                logger_js_1.logger.error('Failed to initialize local embedded MongoDB fallback:', memErr.message);
            }
        }
        else {
            process.exit(1);
        }
    }
}
async function initializeCollections() {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return;
        const collectionsToEnsure = ['users', 'contact_messages', 'audit_logs', 'projects', 'images', 'jobs'];
        const existing = await db.listCollections().toArray();
        const existingNames = new Set(existing.map((c) => c.name));
        for (const name of collectionsToEnsure) {
            if (!existingNames.has(name)) {
                await db.createCollection(name);
                logger_js_1.logger.info(`📁 Created collection '${name}' in MongoDB`);
            }
        }
        // Ensure models are registered and indexes created
        const { User } = await import('../modules/users/user.model.js');
        const { ContactMessage } = await import('../modules/contact/contact.model.js');
        const { AuditLog } = await import('../modules/audit/audit.model.js');
        const { Project } = await import('../modules/projects/project.model.js');
        const { Image } = await import('../modules/images/image.model.js');
        const { Job } = await import('../modules/jobs/job.model.js');
        await Promise.allSettled([
            User.init(),
            ContactMessage.init(),
            AuditLog.init(),
            Project.init(),
            Image.init(),
            Job.init(),
        ]);
        // Insert an initial welcome contact message if empty so Compass shows sample data immediately
        const contactCount = await ContactMessage.countDocuments();
        if (contactCount === 0) {
            await ContactMessage.create({
                name: 'OrbitLens Support',
                email: 'welcome@orbitlens.app',
                subject: 'Welcome to OrbitLens Web Application',
                message: 'Your MongoDB collections (users, contact_messages, projects, images, jobs) are initialized and visible in MongoDB Compass!',
                status: 'read',
            });
            logger_js_1.logger.info('📝 Seeded initial document in contact_messages collection');
        }
        logger_js_1.logger.info('✅ Database collections verified and visible in MongoDB Compass');
    }
    catch (err) {
        logger_js_1.logger.warn(`Could not auto-initialize collections: ${err.message}`);
    }
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    if (mongodInstance) {
        await mongodInstance.stop();
    }
}
