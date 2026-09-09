import { User, IUser } from './user.model.js';

export async function getProfile(userId: string): Promise<Partial<IUser>> {
  const user = await User.findById(userId).select('-passwordHash -refreshTokenHash');
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return user;
}

export async function updateProfile(userId: string, data: { name?: string }): Promise<Partial<IUser>> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return user;
}

export async function deleteAccount(userId: string): Promise<void> {
  await User.findByIdAndDelete(userId);
}
