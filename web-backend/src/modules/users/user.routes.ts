// web-backend/src/modules/users/user.routes.ts

import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  getMeHandler,
  updateMeHandler,
  changePasswordHandler,
  deleteMeHandler,
  exportMeHandler,
} from './user.controller.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth as RequestHandler);

router.get('/me', getMeHandler as RequestHandler);
router.patch('/me', updateMeHandler as RequestHandler);
router.post('/me/change-password', changePasswordHandler as RequestHandler);
router.delete('/me', deleteMeHandler as RequestHandler);
router.get('/me/export', exportMeHandler as RequestHandler);

export default router;
