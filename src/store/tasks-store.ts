import { create } from "zustand";
import type { Task, Subtask, TaskInput, SubtaskInput } from "@/types";
import { getToken } from "@/lib/api";

function authHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (includeContentType) headers["Content-Type"] = "application/json";
  return headers;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: (filters?: Record<string, string>) => Promise<void>;
  createTask: (data: TaskInput) => Promise<void>;
  updateTask: (id: string, data: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, data: SubtaskInput) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/tasks?${params}`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      set({ tasks: data, isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  createTask: async (data: TaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create task");
      }

      const newTask = await res.json();
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<TaskInput>) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update task");
      }

      const updatedTask = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete task");
      }

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to toggle subtask");

      // Refetch tasks to get updated data
      await get().fetchTasks();
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  addSubtask: async (taskId: string, data: SubtaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to add subtask");

      await get().fetchTasks();
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  deleteSubtask: async (taskId: string, subtaskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete subtask");

      await get().fetchTasks();
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
