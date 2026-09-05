// web-backend/src/types/express.d.ts
// Augment Express.User (global namespace) — this is the correct way to extend
// req.user in Express 5 + Passport without conflicting with @types/express.
// @types/passport merges Express.User into Request.user automatically.

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'admin' | 'member';
    }
  }
}

export {};
