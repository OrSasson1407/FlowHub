import { Router } from 'express';
import {
  listIntegrations,
  syncIntegrationById,
  updateIntegration,
  upsertIntegration,
} from '../controllers/integration.controller';
import { requireAuth } from '../middleware/auth';

export const integrationRouter = Router();

integrationRouter.use(requireAuth);
integrationRouter.get('/', listIntegrations);
integrationRouter.post('/', upsertIntegration);
integrationRouter.patch('/:id', updateIntegration);
integrationRouter.post('/:id/sync', syncIntegrationById);
