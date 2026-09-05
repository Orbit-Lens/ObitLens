// web-backend/src/modules/projects/project.model.ts

import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false }
);

// Compound index for fast user-scoped queries
ProjectSchema.index({ userId: 1, createdAt: -1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
