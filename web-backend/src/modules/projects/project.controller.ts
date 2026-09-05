// web-backend/src/modules/projects/project.controller.ts

import type { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service.js';

const DEFAULT_LIMIT = 20;

export async function createProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.body, req.user!.id);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function listProjectsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1));
    const limit = Math.min(100, Number(req.query['limit'] ?? DEFAULT_LIMIT));
    const { projects, total } = await projectService.listProjects(req.user!.id, page, limit);
    res.json({
      success: true,
      data: projects,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProject(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(String(req.params['id']), req.user!.id, req.body);
    res.json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (err) {
    next(err);
  }
}
