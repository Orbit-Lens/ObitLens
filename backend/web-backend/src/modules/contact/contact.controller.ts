import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from './contact.model.js';
import { sendSuccess } from '../../utils/response.js';

export async function submitContactMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, subject, message } = req.body;
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    });

    return sendSuccess(
      res,
      {
        id: contactMessage._id,
        message: 'Your message has been received successfully! Our team will get back to you shortly.',
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function getContactMessagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    return sendSuccess(res, { messages, count: messages.length });
  } catch (err) {
    next(err);
  }
}
