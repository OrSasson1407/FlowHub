import { Op } from 'sequelize';
import { Task } from '../models';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDashboard = async (userId: string, date = new Date()) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [todayTasks, overdueTasks, highPriorityOpen, inboxItems] = await Promise.all([
    Task.findAll({
      where: {
        userId,
        dueDate: { [Op.between]: [dayStart, dayEnd] },
      },
      order: [
        ['dueDate', 'ASC'],
        ['priority', 'DESC'],
      ],
    }),
    Task.findAll({
      where: {
        userId,
        status: { [Op.ne]: 'done' },
        dueDate: { [Op.lt]: dayStart },
      },
      order: [['dueDate', 'ASC']],
    }),
    Task.findAll({
      where: {
        userId,
        priority: 'high',
        status: { [Op.ne]: 'done' },
      },
      limit: 10,
      order: [
        ['dueDate', 'ASC NULLS LAST'],
        ['createdAt', 'DESC'],
      ],
    }),
    Task.findAll({
      where: {
        userId,
        source: { [Op.ne]: 'manual' },
        status: 'todo',
      },
      limit: 20,
      order: [['createdAt', 'DESC']],
    }),
  ]);

  const totalOpen = await Task.count({ where: { userId, status: { [Op.ne]: 'done' } } });
  const doneToday = await Task.count({
    where: {
      userId,
      status: 'done',
      completedAt: { [Op.between]: [dayStart, dayEnd] },
    },
  });

  return {
    date: formatLocalDate(dayStart),
    overview: {
      totalOpen,
      dueToday: todayTasks.length,
      overdue: overdueTasks.length,
      highPriority: highPriorityOpen.length,
      doneToday,
    },
    calendarBlock: todayTasks.filter((task) => task.source === 'calendar'),
    todayTasks,
    overdueTasks,
    highPriorityOpen,
    unifiedInbox: inboxItems,
  };
};
