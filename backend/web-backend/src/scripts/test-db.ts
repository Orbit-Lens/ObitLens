import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  console.log('URI:', env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas!');
    console.log('Database Name:', mongoose.connection.name);
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Collections in database:', collections.map((c) => c.name));

    const logs = await mongoose.connection.db!.collection('audit_logs').find().toArray();
    console.log(`\n📋 AUDIT LOGS (${logs.length} entries):`);
    console.dir(logs, { depth: null });

    const user = await mongoose.connection.db!.collection('users').findOne({ email: 'atlasuser@example.com' });
    console.log('\n👤 UPDATED USER DOCUMENT IN ATLAS:');
    console.dir(user, { depth: null });

    await mongoose.disconnect();
    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ CONNECTION FAILED:');
    console.error(err.message);
    if (err.message.includes('whitelisted') || err.message.includes('Could not connect to any servers')) {
      console.error('\n👉 REASON: Your current IP address is not whitelisted in MongoDB Atlas.');
      console.error('👉 FIX: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Add Current IP or 0.0.0.0/0');
    }
    process.exit(1);
  }
}

testConnection();
