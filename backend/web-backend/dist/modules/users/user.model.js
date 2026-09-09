"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'researcher', 'admin'], default: 'user' },
    googleId: { type: String, sparse: true },
    refreshTokenHash: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash)
        return false;
    return bcryptjs_1.default.compare(candidatePassword, this.passwordHash);
};
UserSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
};
UserSchema.methods.incLoginAttempts = async function () {
    // If previously locked and lock expired, reset
    if (this.lockUntil && this.lockUntil < new Date()) {
        await this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
        return;
    }
    const updates = { $inc: { failedLoginAttempts: 1 } };
    // Lock account for 15 minutes after 5 failed attempts
    if (this.failedLoginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: new Date(Date.now() + 15 * 60 * 1000) };
    }
    await this.updateOne(updates);
};
UserSchema.methods.resetLoginLock = async function () {
    await this.updateOne({
        $set: { failedLoginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};
exports.User = mongoose_1.default.model('User', UserSchema);
