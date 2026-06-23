import { Router } from 'express';
import { todayDashboard, unifiedInbox } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/today', todayDashboard);
dashboardRouter.get('/inbox', unifiedInbox);
