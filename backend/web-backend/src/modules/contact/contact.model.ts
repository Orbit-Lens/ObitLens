import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, default: 'General Inquiry', trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'resolved'],
      default: 'unread',
      index: true,
    },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema, 'contact_messages');
