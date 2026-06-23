import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { Task } from '../models';
import {
  TaskCategory,
  TaskPriority,
  TaskSource,
  TaskStatus,
  taskCategories,
  taskPriorities,
  taskSources,
  taskStatuses,
} from '../types/domain';
import { asyncHandler } from '../utils/async-handler';
import { HttpError, notFound } from '../utils/http-error';
import { enumValue, optionalDate, optionalString, requireString } from '../utils/validators';

type TaskPayload = {
  title?: string;
  description?: string | null;
  source?: TaskSource;
  externalId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryTag?: TaskCategory;
  dueDate?: Date | null;
  completedAt?: Date | null;
};

const parseTaskPayload = (body: Record<string, unknown>, partial = false) => {
  const payload: TaskPayload = {};

  if (!partial || body.title !== undefined) payload.title = requireString(body, 'title');
  if (!partial || body.description !== undefined) {
    payload.description = optionalString(body, 'description');
  }
  if (!partial || body.status !== undefined) {
    payload.status = enumValue(body, 'status', taskStatuses, 'todo') as TaskStatus;
  }
  if (!partial || body.priority !== undefined) {
    payload.priority = enumValue(body, 'priority', taskPriorities, 'medium') as TaskPriority;
  }
  if (!partial || body.categoryTag !== undefined) {
    payload.categoryTag = enumValue(body, 'categoryTag', taskCategories, 'work') as TaskCategory;
  }
  if (!partial || body.source !== undefined) {
    payload.source = enumValue(body, 'source', taskSources, 'manual') as TaskSource;
  }
  if (!partial || body.externalId !== undefined) {
    payload.externalId = optionalString(body, 'externalId');
  }
  if (!partial || body.dueDate !== undefined) {
    payload.dueDate = optionalDate(body, 'dueDate');
  }

  if (payload.status) {
    payload.completedAt = payload.status === 'done' ? new Date() : null;
  }

  return payload;
};

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const where: WhereOptions = { userId: req.user!.id };

  for (const key of ['status', 'priority', 'source', 'categoryTag'] as const) {
    const value = req.query[key];
    if (typeof value === 'string') {
      where[key] = value;
    }
  }

  if (typeof req.query.dueBefore === 'string') {
    const date = new Date(req.query.dueBefore);
    if (Number.isNaN(date.getTime())) throw new HttpError(400, 'dueBefore must be valid date');
    where.dueDate = { [Op.lte]: date };
  }

  const tasks = await Task.findAll({
    where,
    order: [
      ['status', 'ASC'],
      ['dueDate', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  res.json({ tasks });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseTaskPayload(req.body);
  const task = await Task.create({
    userId: req.user!.id,
    title: payload.title!,
    description: payload.description ?? null,
    source: payload.source ?? 'manual',
    externalId: payload.externalId ?? null,
    status: payload.status ?? 'todo',
    priority: payload.priority ?? 'medium',
    categoryTag: payload.categoryTag ?? 'work',
    dueDate: payload.dueDate ?? null,
    completedAt: payload.completedAt ?? null,
  });

  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!task) throw notFound('Task not found');

  res.json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!task) throw notFound('Task not found');

  await task.update(parseTaskPayload(req.body, true));

  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOne({ where: { id: req.params.id, userId: req.user!.id } });
  if (!task) throw notFound('Task not found');

  await task.destroy();
  res.status(204).send();
});
