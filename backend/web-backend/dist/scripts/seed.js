"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_js_1 = require("../config/env.js");
const user_model_js_1 = require("../modules/users/user.model.js");
const contact_model_js_1 = require("../modules/contact/contact.model.js");
const project_model_js_1 = require("../modules/projects/project.model.js");
async function seed() {
    console.log('🌱 Connecting to MongoDB at:', env_js_1.env.MONGODB_URI);
    await mongoose_1.default.connect(env_js_1.env.MONGODB_URI);
    console.log('✅ Connected to database:', mongoose_1.default.connection.name);
    // 1. Ensure Collections
    const collections = ['users', 'contact_messages', 'projects', 'images', 'jobs'];
    const existing = await mongoose_1.default.connection.db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));
    for (const col of collections) {
        if (!existingNames.has(col)) {
            await mongoose_1.default.connection.db.createCollection(col);
            console.log(`📁 Created collection: ${col}`);
        }
    }
    // 2. Seed Default User if not exists
    let testUser = await user_model_js_1.User.findOne({ email: 'sakthivel@orbitlens.app' });
    if (!testUser) {
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash('Password123', salt);
        testUser = await user_model_js_1.User.create({
            name: 'Sakthivel Prakash',
            email: 'sakthivel@orbitlens.app',
            passwordHash,
            role: 'admin',
        });
        console.log('👤 Created default user: sakthivel@orbitlens.app (Password: Password123)');
    }
    else {
        console.log('👤 User sakthivel@orbitlens.app already exists');
    }
    // 3. Seed Sample Contact Messages
    const messageCount = await contact_model_js_1.ContactMessage.countDocuments();
    if (messageCount === 0) {
        await contact_model_js_1.ContactMessage.create([
            {
                name: 'Sakthivel',
                email: 'sakthivel@orbitlens.app',
                subject: 'First Lunar Registration Project',
                message: 'Hello! Setting up the OrbitLens lunar imagery pipeline with Chandrayaan-2 TMC and OHRC datasets.',
                status: 'read',
            },
            {
                name: 'Dr. Vikram',
                email: 'vikram.isro@example.org',
                subject: 'Chandrayaan-2 OHRC Sub-Pixel Alignment',
                message: 'Interested in evaluating the scale-invariant feature extraction accuracy on lunar south pole craters.',
                status: 'unread',
            },
        ]);
        console.log('📬 Seeded 2 sample contact messages in contact_messages');
    }
    else {
        console.log(`📬 Found ${messageCount} contact messages`);
    }
    // 4. Seed Sample Project
    const projectCount = await project_model_js_1.Project.countDocuments();
    if (projectCount === 0) {
        await project_model_js_1.Project.create({
            userId: testUser._id,
            name: 'Chandrayaan-2 South Pole Crater Alignment',
            description: 'Registration and radiometric normalization of OHRC 25cm and TMC 5m images.',
            tags: ['chandrayaan-2', 'ohrc', 'tmc', 'lunar-crater'],
        });
        console.log('🚀 Seeded default project in projects collection');
    }
    else {
        console.log(`🚀 Found ${projectCount} projects`);
    }
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('👉 Open MongoDB Compass and hit Refresh (or press Ctrl+R) to view all collections!');
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
