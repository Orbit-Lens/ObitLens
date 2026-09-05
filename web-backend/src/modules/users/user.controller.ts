// web-backend/src/modules/users/user.controller.ts
// User profile management — Blueprint §7 data portability + confirmation-based delete.

import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../auth/auth.model.js';
import { createAppError } from '../../utils/ownershipCheck.js';

const BCRYPT_ROUNDS = 12;

// ── GET /api/v1/users/me ──────────────────────────────────────────────────────

export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(createAppError('User not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/v1/users/me ────────────────────────────────────────────────────

export async function updateMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { displayName } = req.body as { displayName?: string };
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { displayName } },
      { new: true, runValidators: true }
    );
    if (!user) return next(createAppError('User not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/v1/users/me/change-password ────────────────────────────────────

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await User.findById(req.user!.id).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return next(createAppError('User not found', 404, 'NOT_FOUND'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(createAppError('Current password is incorrect', 401, 'UNAUTHORIZED'));
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await User.updateOne({ _id: user._id }, { passwordHash: newHash });

    res.json({ success: true, data: { message: 'Password updated' } });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/v1/users/me ───────────────────────────────────────────────────
// Blueprint §7 — DELETE /users/me requires confirmation text.

export async function deleteMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { confirmation } = req.body as { confirmation?: string };

    if (confirmation !== 'delete my account') {
      return next(
        createAppError(
          "Send { confirmation: 'delete my account' } to confirm account deletion",
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    await User.deleteOne({ _id: req.user!.id });
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/v1/users/me/export ───────────────────────────────────────────────
// Blueprint §7 — GET /users/me/export endpoint (data portability).

export async function exportMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(createAppError('User not found', 404, 'NOT_FOUND'));

    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}
