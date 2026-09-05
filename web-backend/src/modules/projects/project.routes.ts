// web-backend/src/modules/projects/project.routes.ts

import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  createProjectHandler,
  listProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from './project.controller.js';

const router = Router();

router.use(requireAuth as RequestHandler);

router.post('/', createProjectHandler as RequestHandler);
router.get('/', listProjectsHandler as RequestHandler);
router.get('/:id', getProjectHandler as RequestHandler);
router.patch('/:id', updateProjectHandler as RequestHandler);
router.delete('/:id', deleteProjectHandler as RequestHandler);

export default router;
