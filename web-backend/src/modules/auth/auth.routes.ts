// web-backend/src/modules/auth/auth.routes.ts

import { Router, type RequestHandler } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  googleAuthHandler,
  googleCallbackHandler,
} from './auth.controller.js';

const router = Router();

// Public auth routes
router.post('/register', validate(RegisterSchema) as RequestHandler, registerHandler as RequestHandler);
router.post('/login', validate(LoginSchema) as RequestHandler, loginHandler as RequestHandler);
router.post('/refresh', refreshHandler as RequestHandler);
router.post('/logout', requireAuth as RequestHandler, logoutHandler as RequestHandler);

// Google OAuth (only registered if GOOGLE_CLIENT_ID is set)
router.get('/google', googleAuthHandler as RequestHandler);
router.get('/google/callback', googleCallbackHandler as RequestHandler);

export default router;
