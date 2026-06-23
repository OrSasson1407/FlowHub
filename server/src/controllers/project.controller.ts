import { Request, Response } from 'express';
import { Project } from '../models';
import { asyncHandler } from '../utils/async-handler';
import { notFound } from '../utils/http-error';
import { optionalString, requireString } from '../utils/validators';

const stringArray = (value: unknown, fallback: string[] = []) => {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
};

const boundedProgress = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.findAll({
    where: { userId: req.user!.id },
    order: [['updatedAt', 'DESC']],
  });

  res.json({ projects });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.create({
    userId: req.user!.id,
    name: requireString(req.body, 'name'),
    code: optionalString(req.body, 'code', 80) || 'PROJ',
    description: optionalString(req.body, 'description'),
    progress: boundedProgress(req.body.progress),
    color: optionalString(req.body, 'color', 32) || '#2563EB',
    milestones: stringArray(req.body.milestones, ['Initial Draft Setup']),
    team: stringArray(req.body.team, ['Lead Dev']),
  });

  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw notFound('Project not found');

  const updates: Partial<Project> = {};
  if (req.body.name !== undefined) updates.name = requireString(req.body, 'name');
  if (req.body.code !== undefined) updates.code = optionalString(req.body, 'code', 80) || 'PROJ';
  if (req.body.description !== undefined) updates.description = optionalString(req.body, 'description');
  if (req.body.progress !== undefined) updates.progress = boundedProgress(req.body.progress);
  if (req.body.color !== undefined) updates.color = optionalString(req.body, 'color', 32) || '#2563EB';
  if (req.body.milestones !== undefined) updates.milestones = stringArray(req.body.milestones);
  if (req.body.team !== undefined) updates.team = stringArray(req.body.team);

  await project.update(updates);
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!project) throw notFound('Project not found');

  await project.destroy();
  res.status(204).send();
});
