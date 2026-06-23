import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth';

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get('/', listTasks);
taskRouter.post('/', createTask);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
