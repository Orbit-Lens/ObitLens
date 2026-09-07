import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  userEmail?: string;
  action: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: { type: String, trim: true, index: true },
    action: { type: String, required: true, index: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true, index: true },
    details: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema, 'audit_logs');
