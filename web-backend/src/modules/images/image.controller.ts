// web-backend/src/modules/images/image.controller.ts

import type { Request, Response, NextFunction } from 'express';
import * as imageService from './image.service.js';

const DEFAULT_LIMIT = 20;

export async function requestUploadUrlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, uploadUrl } = await imageService.requestUploadUrl(req.body, req.user!.id);
    res.status(201).json({ success: true, data: { image, uploadUrl } });
  } catch (err) {
    next(err);
  }
}

export async function confirmUploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await imageService.confirmUpload(String(req.params['id']), req.user!.id, req.body);
    res.json({ success: true, data: { image } });
  } catch (err) {
    next(err);
  }
}

export async function listImagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1));
    const limit = Math.min(100, Number(req.query['limit'] ?? DEFAULT_LIMIT));
    const projectId = req.query['projectId'] as string | undefined;
    const { images, total } = await imageService.listImages(req.user!.id, projectId, page, limit);
    res.json({
      success: true,
      data: images,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await imageService.getImage(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { image } });
  } catch (err) {
    next(err);
  }
}

export async function getImageDownloadUrlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await imageService.getImageDownloadUrl(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { downloadUrl: url } });
  } catch (err) {
    next(err);
  }
}

export async function deleteImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await imageService.deleteImage(String(req.params['id']), req.user!.id);
    res.json({ success: true, data: { message: 'Image deleted' } });
  } catch (err) {
    next(err);
  }
}
