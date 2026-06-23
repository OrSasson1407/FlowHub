import { Router } from 'express';
import { authRouter } from './auth.routes';
import { dashboardRouter } from './dashboard.routes';
import { integrationRouter } from './integration.routes';
import { projectRouter } from './project.routes';
import { taskRouter } from './task.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/integrations', integrationRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/tasks', taskRouter);
