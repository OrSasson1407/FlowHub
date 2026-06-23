import { Router } from 'express';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../controllers/project.controller';
import { requireAuth } from '../middleware/auth';

export const projectRouter = Router();

projectRouter.use(requireAuth);
projectRouter.get('/', listProjects);
projectRouter.post('/', createProject);
projectRouter.patch('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);
