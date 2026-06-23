export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "work" | "study" | "personal" | "deadline";
export type TaskSource = "manual" | "github" | "jira" | "gmail" | "calendar";
export type IntegrationProvider = "github" | "jira" | "gmail" | "calendar";

export interface ApiUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface ApiTask {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  source: TaskSource;
  externalId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  categoryTag: TaskCategory;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiIntegration {
  id: string;
  provider: IntegrationProvider;
  isActive: boolean;
  configuredAt: string;
  tokenExpiresAt: string | null;
  lastSyncedAt: string | null;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}

export interface ApiProject {
  id: string;
  userId: string;
  name: string;
  code: string;
  description: string | null;
  progress: number;
  color: string;
  milestones: string[];
  team: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodayDashboard {
  date: string;
  overview: {
    totalOpen: number;
    dueToday: number;
    overdue: number;
    highPriority: number;
    doneToday: number;
  };
  calendarBlock: ApiTask[];
  todayTasks: ApiTask[];
  overdueTasks: ApiTask[];
  highPriorityOpen: ApiTask[];
  unifiedInbox: ApiTask[];
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryTag?: TaskCategory;
  source?: TaskSource;
  externalId?: string | null;
  dueDate?: string | null;
}

export interface CreateProjectInput {
  name: string;
  code?: string;
  description?: string | null;
  progress?: number;
  color?: string;
  milestones?: string[];
  team?: string[];
}
