import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    logger.info(`✅ MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    await initializeCollections();
  } catch (error: any) {
    logger.warn(`⚠️ Could not connect to remote MongoDB Atlas (${error.message}).`);
    
    if (env.NODE_ENV !== 'production') {
      try {
        logger.info('🚀 Starting local embedded MongoMemoryServer fallback for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const localUri = mongodInstance.getUri();
        
        await mongoose.connect(localUri);
        logger.info(`✅ Local embedded MongoDB active and ready at ${localUri}`);
        await initializeCollections();
      } catch (memErr: any) {
        logger.error('Failed to initialize local embedded MongoDB fallback:', memErr.message);
      }
    } else {
      process.exit(1);
    }
  }
}

async function initializeCollections(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collectionsToEnsure = ['users', 'contact_messages', 'audit_logs', 'projects', 'images', 'jobs'];
    const existing = await db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));

    for (const name of collectionsToEnsure) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        logger.info(`📁 Created collection '${name}' in MongoDB`);
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
      logger.info('📝 Seeded initial document in contact_messages collection');
    }

    logger.info('✅ Database collections verified and visible in MongoDB Compass');
  } catch (err: any) {
    logger.warn(`Could not auto-initialize collections: ${err.message}`);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

