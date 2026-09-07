import { Router } from 'express';
import { submitContactMessageHandler, getContactMessagesHandler } from './contact.controller.js';
import { validate } from '../../middleware/validate.js';
import { createContactMessageSchema } from './contact.schema.js';

const router = Router();

// Public: Submit a contact message from contact form
router.post('/', validate({ body: createContactMessageSchema }), submitContactMessageHandler);

// Authenticated/Admin: View contact messages
router.get('/', getContactMessagesHandler);

export default router;
