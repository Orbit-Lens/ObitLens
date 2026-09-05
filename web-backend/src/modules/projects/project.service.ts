// web-backend/src/modules/projects/project.service.ts

import { Types } from 'mongoose';
import { Project, type IProject } from './project.model.js';
import { assertOwnership, createAppError } from '../../utils/ownershipCheck.js';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export async function createProject(input: CreateProjectInput, userId: string): Promise<IProject> {
  const project = await Project.create({
    userId: new Types.ObjectId(userId),
    name: input.name,
    ...(input.description !== undefined ? { description: input.description } : {}),
  });
  return project;
}

export async function listProjects(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ projects: IProject[]; total: number }> {
  const query = { userId: new Types.ObjectId(userId) };
  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(query),
  ]);
  return { projects, total };
}

export async function getProject(projectId: string, userId: string): Promise<IProject> {
  return assertOwnership(Project, projectId, userId);
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<CreateProjectInput>
): Promise<IProject> {
  await assertOwnership(Project, projectId, userId);
  const updated = await Project.findByIdAndUpdate(
    projectId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!updated) throw createAppError('Project not found', 404, 'NOT_FOUND');
  return updated;
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  await assertOwnership(Project, projectId, userId);
  await Project.deleteOne({ _id: projectId });
}
