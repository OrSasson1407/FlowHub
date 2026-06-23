export const taskStatuses = ['todo', 'in_progress', 'done'] as const;
export const taskPriorities = ['low', 'medium', 'high'] as const;
export const taskCategories = ['work', 'study', 'personal', 'deadline'] as const;
export const taskSources = ['manual', 'github', 'jira', 'gmail', 'calendar'] as const;
export const integrationProviders = ['github', 'jira', 'gmail', 'calendar'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskCategory = (typeof taskCategories)[number];
export type TaskSource = (typeof taskSources)[number];
export type IntegrationProvider = (typeof integrationProviders)[number];

export type AuthUser = {
  id: string;
  email: string;
};
