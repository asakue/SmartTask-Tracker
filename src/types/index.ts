export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  tags: string[];
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusSession {
  id: string;
  duration: number;
  completed: boolean;
  taskId: string | null;
  userId: string;
  startedAt: Date;
  createdAt: Date;
}

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string | null;
  tags?: string[];
  color?: string;
}

export interface SubtaskInput {
  title: string;
  completed?: boolean;
}

// Dashboard analytics types
export interface TaskStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  byPriority: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  byCategory: Record<string, number>;
}

export interface DailyProductivity {
  day: string;
  completed: number;
  created: number;
}

export interface WeeklyStats {
  weekCompleted: number;
  weekCreated: number;
  monthCompleted: number;
  monthCreated: number;
  streak: number;
}
