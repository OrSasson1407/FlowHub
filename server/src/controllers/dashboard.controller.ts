import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task } from '../models';
import { getTodayDashboard } from '../services/dashboard.service';
import { asyncHandler } from '../utils/async-handler';
import { HttpError } from '../utils/http-error';

export const todayDashboard = asyncHandler(async (req: Request, res: Response) => {
  const date =
    typeof req.query.date === 'string' && req.query.date
      ? new Date(req.query.date)
      : new Date();

  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'date must be a valid ISO date string');
  }

  const dashboard = await getTodayDashboard(req.user!.id, date);
  res.json({ dashboard });
});

export const unifiedInbox = asyncHandler(async (req: Request, res: Response) => {
  const inbox = await Task.findAll({
    where: {
      userId: req.user!.id,
      source: { [Op.ne]: 'manual' },
      status: { [Op.ne]: 'done' },
    },
    order: [
      ['priority', 'DESC'],
      ['dueDate', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  res.json({ inbox });
});
