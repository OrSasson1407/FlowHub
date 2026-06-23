import { Integration, Task } from '../models';
import { integrationAdapters } from './integration-adapters';

export const syncIntegration = async (integration: Integration) => {
  const adapter = integrationAdapters[integration.provider];
  const items = await adapter.fetchItems(integration.accessToken);

  let upserted = 0;

  for (const item of items) {
    await Task.upsert({
      userId: integration.userId,
      title: item.title,
      description: item.description || null,
      source: item.source,
      externalId: item.externalId,
      status: 'todo',
      priority: item.priority,
      categoryTag: item.categoryTag,
      dueDate: item.dueDate || null,
      completedAt: null,
    });
    upserted += 1;
  }

  integration.lastSyncedAt = new Date();
  await integration.save();

  return { provider: integration.provider, upserted, syncedAt: integration.lastSyncedAt };
};
