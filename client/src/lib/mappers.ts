import type { ApiIntegration, ApiProject, ApiTask, TaskCategory } from "@/types/api";
import type { InboxItem, Task, TimelineEvent, WorkspaceConfig } from "@/types/ui";

const categoryLabels: Record<TaskCategory, string> = {
  work: "Work",
  study: "Study",
  personal: "Personal",
  deadline: "Deadline",
};

const toCategoryTag = (category?: string): TaskCategory => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("study")) return "study";
  if (normalized.includes("personal")) return "personal";
  if (normalized.includes("deadline")) return "deadline";
  return "work";
};

export const dueInHours = (dueDate?: string | null) => {
  if (!dueDate) return undefined;
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / 3_600_000));
};

export const apiTaskToUiTask = (task: ApiTask): Task => ({
  id: task.id,
  title: task.title,
  dueInHours: dueInHours(task.dueDate),
  dueDate: task.dueDate || undefined,
  priority: task.priority,
  completed: task.status === "done",
  notes: task.description || undefined,
  category: categoryLabels[task.categoryTag],
});

export const uiCategoryToApi = toCategoryTag;

export const taskDueDateFromHours = (hours?: number) => {
  if (!hours) return null;
  return new Date(Date.now() + hours * 3_600_000).toISOString();
};

export const apiTaskToEvent = (task: ApiTask): TimelineEvent => {
  const date = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
  return {
    id: task.id,
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    title: task.title,
    location: task.description || "FlowHub Calendar",
    durationMinutes: 60,
  };
};

export const apiTaskToInboxItem = (task: ApiTask): InboxItem => ({
  id: task.id,
  source: task.source === "gmail" ? "email" : task.source === "manual" ? "system" : task.source,
  title: task.title,
  timeDelta: relativeTime(task.createdAt),
  archived: task.status === "done",
  detailText: task.description || `${task.source} item imported into FlowHub.`,
});

export const apiProjectToUiProject = (project: ApiProject) => ({
  id: project.id,
  name: project.name,
  code: project.code,
  description: project.description || "",
  progress: project.progress,
  color: project.color,
  milestones: project.milestones || [],
  team: project.team || [],
});

export const configFromIntegrations = (email: string, integrations: ApiIntegration[]): WorkspaceConfig => ({
  email,
  calendarSynced: integrations.some((integration) => integration.provider === "calendar" && integration.isActive)
    ? "google"
    : null,
  connectedIntegrations: integrations
    .filter((integration) => integration.isActive)
    .map((integration) => integration.provider),
  setupCompleted: true,
  hasSeenWizard: true,
});

const relativeTime = (value: string) => {
  const diffSeconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
