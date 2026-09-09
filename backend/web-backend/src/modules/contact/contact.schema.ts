import { z } from 'zod';

export const createContactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(2).default('General Inquiry').optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
