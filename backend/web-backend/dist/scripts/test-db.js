"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
async function testConnection() {
    console.log('Testing connection to MongoDB Atlas...');
    console.log('URI:', env_js_1.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
    try {
        await mongoose_1.default.connect(env_js_1.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas!');
        console.log('Database Name:', mongoose_1.default.connection.name);
        const collections = await mongoose_1.default.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map((c) => c.name));
        const logs = await mongoose_1.default.connection.db.collection('audit_logs').find().toArray();
        console.log(`\n📋 AUDIT LOGS (${logs.length} entries):`);
        console.dir(logs, { depth: null });
        const user = await mongoose_1.default.connection.db.collection('users').findOne({ email: 'atlasuser@example.com' });
        console.log('\n👤 UPDATED USER DOCUMENT IN ATLAS:');
        console.dir(user, { depth: null });
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (err) {
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
