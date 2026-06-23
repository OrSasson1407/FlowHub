"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Bell, Loader2, Search, Settings, Sliders, Sparkles, X } from "lucide-react";
import CalendarView from "@/components/CalendarView";
import Dashboard from "@/components/Dashboard";
import ProjectsView from "@/components/ProjectsView";
import Sidebar from "@/components/Sidebar";
import TasksList from "@/components/TasksList";
import { api, ApiError } from "@/lib/api";
import {
  apiProjectToUiProject,
  apiTaskToEvent,
  apiTaskToInboxItem,
  apiTaskToUiTask,
  configFromIntegrations,
  taskDueDateFromHours,
  uiCategoryToApi,
} from "@/lib/mappers";
import type { ApiProject, ApiTask, TaskPriority } from "@/types/api";
import type { Task, TimelineEvent, WorkspaceConfig } from "@/types/ui";

const queryClient = new QueryClient();

const defaultConfig: WorkspaceConfig = {
  email: "",
  calendarSynced: null,
  connectedIntegrations: [],
  setupCompleted: false,
  hasSeenWizard: false,
};

function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const authenticate = useMutation({
    mutationFn: () => (mode === "login" ? api.login(email, password) : api.register(email, password)),
    onSuccess: (data) => {
      localStorage.setItem("flowhub_token", data.token);
      localStorage.setItem("flowhub_user_email", data.user.email);
      window.location.reload();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    authenticate.mutate();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-5">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">FlowHub</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">Your day, wired into one workspace.</h1>
          </div>
          <p className="text-sm leading-7 text-slate-500 max-w-md">
            Connect to the backend API, load your real tasks, triage imported items, and keep projects moving without demo data.
          </p>
        </div>

        <form onSubmit={submit} className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{mode === "login" ? "Sign in" : "Create account"}</h2>
              <p className="text-xs text-slate-500 mt-1">Uses `/api/auth/{mode === "login" ? "login" : "register"}` on the FlowHub server.</p>
            </div>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[10px] font-bold text-slate-500 tracking-widest uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[10px] font-bold text-slate-500 tracking-widest uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={authenticate.isPending}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {authenticate.isPending ? "Connecting..." : mode === "login" ? "Sign in" : "Create workspace"}
          </button>
        </form>
      </section>
    </main>
  );
}

function ConnectedWorkspace() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "calendar" | "projects">("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalPriority, setModalPriority] = useState<TaskPriority>("high");
  const [modalCategory, setModalCategory] = useState("Work");

  useEffect(() => {
    setToken(localStorage.getItem("flowhub_token"));
    setStoredEmail(localStorage.getItem("flowhub_user_email") || "");
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const enabled = Boolean(token);
  const me = useQuery({ queryKey: ["me", token], queryFn: () => api.me(token!), enabled });
  const tasksQuery = useQuery({ queryKey: ["tasks", token], queryFn: () => api.tasks(token!), enabled });
  const dashboardQuery = useQuery({ queryKey: ["dashboard", token], queryFn: () => api.today(token!), enabled });
  const integrationsQuery = useQuery({ queryKey: ["integrations", token], queryFn: () => api.integrations(token!), enabled });
  const projectsQuery = useQuery({ queryKey: ["projects", token], queryFn: () => api.projects(token!), enabled });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks", token] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", token] });
    queryClient.invalidateQueries({ queryKey: ["projects", token] });
    queryClient.invalidateQueries({ queryKey: ["integrations", token] });
  };

  const createTask = useMutation({
    mutationFn: (task: Omit<Task, "id" | "completed">) =>
      api.createTask(token!, {
        title: task.title,
        description: task.notes || null,
        priority: task.priority,
        categoryTag: uiCategoryToApi(task.category),
        source: "manual",
        dueDate: taskDueDateFromHours(task.dueInHours),
      }),
    onSuccess: () => {
      invalidate();
      setToastMessage("Task created.");
    },
  });

  const createCalendarTask = useMutation({
    mutationFn: (event: Omit<TimelineEvent, "id">) =>
      api.createTask(token!, {
        title: event.title,
        description: event.location,
        priority: "medium",
        categoryTag: "work",
        source: "calendar",
        dueDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      invalidate();
      setToastMessage("Calendar block added.");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<ApiTask> }) => api.updateTask(token!, id, task),
    onSuccess: invalidate,
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.deleteTask(token!, id),
    onSuccess: () => {
      invalidate();
      setToastMessage("Task deleted.");
    },
  });

  const createProject = useMutation({
    mutationFn: (project: { name: string; code: string; description: string; milestones: string[] }) =>
      api.createProject(token!, { ...project, progress: 0, color: "#2563EB", team: ["Lead Dev"] }),
    onSuccess: () => {
      invalidate();
      setToastMessage("Project created.");
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ApiProject> }) => api.updateProject(token!, id, updates),
    onSuccess: invalidate,
  });

  const tasks = useMemo(() => (tasksQuery.data?.tasks || []).map(apiTaskToUiTask), [tasksQuery.data]);
  const events = useMemo(
    () => (dashboardQuery.data?.dashboard.calendarBlock || []).map(apiTaskToEvent),
    [dashboardQuery.data],
  );
  const inbox = useMemo(
    () => (dashboardQuery.data?.dashboard.unifiedInbox || []).map(apiTaskToInboxItem),
    [dashboardQuery.data],
  );
  const projects = useMemo(
    () => (projectsQuery.data?.projects || []).map(apiProjectToUiProject),
    [projectsQuery.data],
  );
  const config = useMemo(
    () => configFromIntegrations(me.data?.user.email || storedEmail, integrationsQuery.data?.integrations || []),
    [me.data, storedEmail, integrationsQuery.data],
  );

  if (!token) return <AuthPanel />;

  if (me.isLoading || tasksQuery.isLoading || dashboardQuery.isLoading || integrationsQuery.isLoading || projectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        Loading FlowHub workspace...
      </div>
    );
  }

  const error = me.error || tasksQuery.error || dashboardQuery.error || integrationsQuery.error || projectsQuery.error;
  if (error) {
    const message = error instanceof ApiError || error instanceof Error ? error.message : "Unable to load workspace.";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <h1 className="mt-3 text-lg font-bold text-slate-900">Backend connection failed</h1>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          <button
            onClick={() => {
              localStorage.removeItem("flowhub_token");
              window.location.reload();
            }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
          >
            Reset session
          </button>
        </div>
      </div>
    );
  }

  const toggleTask = (id: string) => {
    const task = tasksQuery.data?.tasks.find((item) => item.id === id);
    if (!task) return;
    updateTask.mutate({ id, task: { status: task.status === "done" ? "todo" : "done" } });
  };

  const delayTask = (id: string) => {
    const task = tasksQuery.data?.tasks.find((item) => item.id === id);
    if (!task) return;
    const base = task.dueDate ? new Date(task.dueDate) : new Date();
    base.setHours(base.getHours() + 12);
    updateTask.mutate({ id, task: { dueDate: base.toISOString() } });
    setToastMessage("Action delayed by 12 hours.");
  };

  const archiveInbox = (id: string) => {
    updateTask.mutate({ id, task: { status: "done" } });
    setToastMessage("Notification triaged.");
  };

  const handleModalSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!modalTitle.trim()) return;
    createTask.mutate({
      title: modalTitle.trim(),
      priority: modalPriority,
      dueInHours: 12,
      category: modalCategory,
    });
    setModalTitle("");
    setIsNewTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          onOpenArchivedModal={() => setIsArchivedModalOpen(true)}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onLaunchWizard={() => setIsSettingsOpen(true)}
        />

        <div className="ml-60 flex-grow min-h-screen flex flex-col">
          <header className="flex justify-between items-center px-8 w-full h-16 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.01)] select-none">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setToastMessage(`Searching workspace for "${globalSearch}"`);
              }}
              className="relative flex items-center md:w-80"
            >
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Jump to..."
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-0 focus:bg-white focus:ring-1 focus:ring-blue-600 rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-500/60 focus:outline-none w-full transition-all"
              />
            </form>

            <div className="flex items-center gap-5">
              <button onClick={() => setToastMessage("Notifications up to date")} className="text-slate-500 hover:bg-slate-100 hover:text-blue-600 p-2 rounded-xl transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="text-slate-500 hover:bg-slate-100 hover:text-blue-600 p-2 rounded-xl transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <span className="font-mono text-[10px] text-slate-500 hidden sm:block">Active: {config.email}</span>
                <div className="h-8 w-8 bg-blue-600 rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-white text-xs font-bold">
                  {config.email.slice(0, 1).toUpperCase() || "F"}
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 md:p-8 flex-grow max-w-[1280px] w-full mx-auto animate-fadeIn">
            {activeTab === "dashboard" && (
              <Dashboard
                config={config}
                todayDate={dashboardQuery.data?.dashboard.date || new Date().toISOString().slice(0, 10)}
                tasks={tasks}
                events={events}
                inbox={inbox}
                onToggleTask={toggleTask}
                onDelayTask={delayTask}
                onArchiveInbox={archiveInbox}
                onArchiveAllInbox={() => inbox.forEach((item) => archiveInbox(item.id))}
                onSelectAllInbox={() => setToastMessage("Selected all notifications.")}
                onAddQuickTask={(title, priority) => createTask.mutate({ title, priority, dueInHours: 6, category: "Work" })}
              />
            )}

            {activeTab === "tasks" && (
              <TasksList
                tasks={tasks}
                onToggleTask={toggleTask}
                onAddTask={(task) => createTask.mutate(task)}
                onDeleteTask={(id) => deleteTask.mutate(id)}
                onArchiveTask={(id) => archiveInbox(id)}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView
                events={events}
                onAddEvent={(event) => createCalendarTask.mutate(event)}
                onDeleteEvent={(id) => deleteTask.mutate(id)}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsView
                projects={projects}
                onAddProject={(project) => createProject.mutate(project)}
                onUpdateProject={(id, updates) => updateProject.mutate({ id, updates })}
              />
            )}
          </main>
        </div>
      </div>

      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl w-full max-w-sm shadow-xl animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Insertion</h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <input
                value={modalTitle}
                onChange={(event) => setModalTitle(event.target.value)}
                placeholder="Review code updates"
                className="w-full bg-white border border-slate-200 rounded-xl text-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-4">
                <select value={modalPriority} onChange={(event) => setModalPriority(event.target.value as TaskPriority)} className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2">
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
                <input value={modalCategory} onChange={(event) => setModalCategory(event.target.value)} className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2" />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700">
                Insert Task
              </button>
            </form>
          </div>
        </div>
      )}

      {isArchivedModalOpen && (
        <Modal title="Archived Tasks Storage" onClose={() => setIsArchivedModalOpen(false)}>
          <p className="text-xs text-slate-500">Archived items are represented by completed backend tasks.</p>
        </Modal>
      )}

      {isHelpModalOpen && (
        <Modal title="Workspace Keyboard Shortcuts" onClose={() => setIsHelpModalOpen(false)}>
          <p className="text-xs text-slate-500">Use the sidebar and task controls to manage your real FlowHub data.</p>
        </Modal>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-40 flex justify-end backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-sm w-full h-full p-6 md:p-8 flex flex-col justify-between shadow-xl animate-slideLeft border-l border-slate-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Active Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-1.5 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("flowhub_token");
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                <Sliders className="w-4 h-4" /> Sign out
              </button>
            </div>
            <p className="font-mono text-[9px] text-center text-slate-400">FlowHub API: real backend mode</p>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 z-50 text-xs border-l-4 border-l-blue-500">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/30 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-100 p-6 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-950 p-1 hover:bg-slate-50 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectedWorkspace />
    </QueryClientProvider>
  );
}
