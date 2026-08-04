import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "Не назначена";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "HIGH":
      return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400";
    case "MEDIUM":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
    case "LOW":
      return "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400";
  }
}

export function getPriorityBadge(priority: string): string {
  switch (priority) {
    case "HIGH":
      return "Высокий";
    case "MEDIUM":
      return "Средний";
    case "LOW":
      return "Низкий";
    default:
      return priority;
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "PLANNED":
      return "В планах";
    case "IN_PROGRESS":
      return "В процессе";
    case "COMPLETED":
      return "Выполнено";
    default:
      return status;
  }
}

export function getDaysOfWeek(): string[] {
  return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
}

export function getDaysOfWeekShort(): string[] {
  return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isOverdue(date: Date | null, status: string): boolean {
  if (!date || status === "COMPLETED") return false;
  return new Date(date) < new Date();
}
