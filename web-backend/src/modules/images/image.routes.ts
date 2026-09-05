// web-backend/src/modules/images/image.routes.ts

import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import { UploadUrlSchema, ConfirmUploadSchema } from './image.schema.js';
import {
  requestUploadUrlHandler,
  confirmUploadHandler,
  listImagesHandler,
  getImageHandler,
  getImageDownloadUrlHandler,
  deleteImageHandler,
} from './image.controller.js';

const router = Router();

router.use(requireAuth as RequestHandler);

// Blueprint §4 — Presigned URL upload flow
router.post('/upload-url', validate(UploadUrlSchema) as RequestHandler, requestUploadUrlHandler as RequestHandler);
router.post('/:id/confirm', validate(ConfirmUploadSchema) as RequestHandler, confirmUploadHandler as RequestHandler);

router.get('/', listImagesHandler as RequestHandler);
router.get('/:id', getImageHandler as RequestHandler);
router.get('/:id/download-url', getImageDownloadUrlHandler as RequestHandler);
router.delete('/:id', deleteImageHandler as RequestHandler);

export default router;
