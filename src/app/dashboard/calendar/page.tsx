"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { useTasksStore } from "@/store/tasks-store";
import CalendarView from "@/components/tasks/calendar-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/tasks/task-form";
import { toast } from "sonner";

export default function CalendarPage() {
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      toast.success("Задача создана");
    } catch {
      toast.error("Ошибка при создании задачи");
    }
  };

  const handleUpdateTask = async (id: string, data: any) => {
    try {
      await updateTask(id, data);
      toast.success("Задача обновлена");
    } catch {
      toast.error("Ошибка при обновлении задачи");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Удалить задачу?")) {
      try {
        await deleteTask(id);
        toast.success("Задача удалена");
      } catch {
        toast.error("Ошибка при удалении задачи");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Календарь</h1>
            <p className="text-sm text-muted-foreground">
              Задачи по датам дедлайнов
            </p>
          </div>
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            Новая задача
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <CalendarView
            tasks={tasks}
            onEdit={(task) => {}}
            onDelete={handleDeleteTask}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
