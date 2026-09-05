// web-backend/src/modules/auth/auth.model.ts
// User document — stores credentials, OAuth link, refresh-token state, and lockout info.
// Blueprint §7 — Passwords hashed with bcrypt; refresh tokens hashed at rest;
//                account lockout after N failed logins.

import mongoose, { type Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  googleTokenEncrypted?: string;
  role: 'admin' | 'member';
  // Refresh token rotation state
  refreshTokenHash?: string;       // bcrypt hash of the current valid token
  refreshTokenFamily?: string;     // UUID; reuse of old family triggers revocation
  // Account lockout (Blueprint gap — 5 attempts → 15min lockout)
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },  // Not returned by default
    googleId: { type: String, sparse: true, unique: true },
    googleTokenEncrypted: { type: String, select: false },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    refreshTokenHash: { type: String, select: false },
    refreshTokenFamily: { type: String, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent timing attacks — never expose passwordHash in default queries
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.refreshTokenFamily;
    delete ret.googleTokenEncrypted;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
