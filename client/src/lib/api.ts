import type {
  ApiIntegration,
  ApiProject,
  ApiTask,
  AuthResponse,
  CreateProjectInput,
  CreateTaskInput,
  TodayDashboard,
} from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error || message;
    } catch {
      // Keep the default message for non-JSON failures.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => request<{ user: AuthResponse["user"] }>("/auth/me", {}, token),

  today: (token: string) =>
    request<{ dashboard: TodayDashboard }>("/dashboard/today", {}, token),
  inbox: (token: string) => request<{ inbox: ApiTask[] }>("/dashboard/inbox", {}, token),

  tasks: (token: string) => request<{ tasks: ApiTask[] }>("/tasks", {}, token),
  createTask: (token: string, input: CreateTaskInput) =>
    request<{ task: ApiTask }>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }, token),
  updateTask: (token: string, id: string, input: Partial<CreateTaskInput>) =>
    request<{ task: ApiTask }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }, token),
  deleteTask: (token: string, id: string) =>
    request<void>(`/tasks/${id}`, { method: "DELETE" }, token),

  integrations: (token: string) =>
    request<{ integrations: ApiIntegration[] }>("/integrations", {}, token),
  upsertIntegration: (token: string, provider: ApiIntegration["provider"]) =>
    request<{ integration: ApiIntegration }>("/integrations", {
      method: "POST",
      body: JSON.stringify({ provider, isActive: true }),
    }, token),

  projects: (token: string) => request<{ projects: ApiProject[] }>("/projects", {}, token),
  createProject: (token: string, input: CreateProjectInput) =>
    request<{ project: ApiProject }>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }, token),
  updateProject: (token: string, id: string, input: Partial<CreateProjectInput>) =>
    request<{ project: ApiProject }>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }, token),
  deleteProject: (token: string, id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }, token),
};
