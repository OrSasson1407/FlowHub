import { IntegrationProvider, TaskCategory, TaskPriority, TaskSource } from '../types/domain';

export type ExternalTask = {
  externalId: string;
  title: string;
  description?: string | null;
  source: TaskSource;
  priority: TaskPriority;
  categoryTag: TaskCategory;
  dueDate?: Date | null;
};

export type IntegrationAdapter = {
  provider: IntegrationProvider;
  validateCredentials: (accessToken?: string | null) => Promise<boolean>;
  fetchItems: (accessToken?: string | null) => Promise<ExternalTask[]>;
};

const inactiveAdapter = (provider: IntegrationProvider): IntegrationAdapter => ({
  provider,
  validateCredentials: async (accessToken) => Boolean(accessToken),
  fetchItems: async () => [],
});

export const integrationAdapters: Record<IntegrationProvider, IntegrationAdapter> = {
  github: inactiveAdapter('github'),
  jira: inactiveAdapter('jira'),
  gmail: inactiveAdapter('gmail'),
  calendar: inactiveAdapter('calendar'),
};
