import { Request, Response } from 'express';
import { Integration } from '../models';
import {
  IntegrationProvider,
  integrationProviders,
} from '../types/domain';
import { asyncHandler } from '../utils/async-handler';
import { HttpError, notFound } from '../utils/http-error';
import { enumValue, optionalDate, optionalString } from '../utils/validators';
import { integrationAdapters } from '../services/integration-adapters';
import { syncIntegration } from '../services/sync.service';

const sanitizeIntegration = (integration: Integration) => ({
  id: integration.id,
  provider: integration.provider,
  isActive: integration.isActive,
  configuredAt: integration.configuredAt,
  tokenExpiresAt: integration.tokenExpiresAt,
  lastSyncedAt: integration.lastSyncedAt,
  hasAccessToken: Boolean(integration.accessToken),
  hasRefreshToken: Boolean(integration.refreshToken),
});

export const listIntegrations = asyncHandler(async (req: Request, res: Response) => {
  const integrations = await Integration.findAll({
    where: { userId: req.user!.id },
    order: [['provider', 'ASC']],
  });

  res.json({ integrations: integrations.map(sanitizeIntegration) });
});

export const upsertIntegration = asyncHandler(async (req: Request, res: Response) => {
  const provider = enumValue(
    req.body,
    'provider',
    integrationProviders,
  ) as IntegrationProvider;
  const accessToken = optionalString(req.body, 'accessToken');
  const refreshToken = optionalString(req.body, 'refreshToken');
  const tokenExpiresAt = optionalDate(req.body, 'tokenExpiresAt');
  const isActive = req.body.isActive === undefined ? true : Boolean(req.body.isActive);

  const credentialsAreValid = await integrationAdapters[provider].validateCredentials(accessToken);
  if (!credentialsAreValid && accessToken) {
    throw new HttpError(400, 'Integration credentials could not be validated');
  }

  const [integration] = await Integration.upsert(
    {
      userId: req.user!.id,
      provider,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      isActive,
      configuredAt: new Date(),
      lastSyncedAt: null,
    },
    { returning: true },
  );

  res.status(201).json({ integration: sanitizeIntegration(integration) });
});

export const updateIntegration = asyncHandler(async (req: Request, res: Response) => {
  const integration = await Integration.findOne({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!integration) throw notFound('Integration not found');

  if (req.body.accessToken !== undefined) {
    integration.accessToken = optionalString(req.body, 'accessToken');
  }
  if (req.body.refreshToken !== undefined) {
    integration.refreshToken = optionalString(req.body, 'refreshToken');
  }
  if (req.body.tokenExpiresAt !== undefined) {
    integration.tokenExpiresAt = optionalDate(req.body, 'tokenExpiresAt');
  }
  if (req.body.isActive !== undefined) {
    integration.isActive = Boolean(req.body.isActive);
  }

  await integration.save();
  res.json({ integration: sanitizeIntegration(integration) });
});

export const syncIntegrationById = asyncHandler(async (req: Request, res: Response) => {
  const integration = await Integration.findOne({
    where: { id: req.params.id, userId: req.user!.id, isActive: true },
  });
  if (!integration) throw notFound('Active integration not found');

  const result = await syncIntegration(integration);
  res.json({ sync: result });
});
