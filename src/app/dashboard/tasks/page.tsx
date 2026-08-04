"use client";

import { Suspense, useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/layout";
import { useTasksStore } from "@/store/tasks-store";
import TaskCard from "@/components/tasks/task-card";
import KanbanBoard from "@/components/tasks/kanban-board";
import CalendarView from "@/components/tasks/calendar-view";
import TaskForm from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutList,
  LayoutGrid,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasksStore();

  const [view, setView] = useState<"list" | "kanban" | "calendar">(
    searchParams.get("view") === "kanban" ? "kanban" : "list"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const filteredTasks = tasks
    .filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return order === "asc" ? -1 : 1;
      if (bVal == null) return order === "asc" ? 1 : -1;
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      setDialogOpen(false);
      toast.success("Задача создана");
    } catch {
      toast.error("Ошибка при создании задачи");
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      setDialogOpen(false);
      setEditingTask(null);
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

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await updateTask(id, { status });
    } catch {
      toast.error("Ошибка при изменении статуса");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Задачи</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length} всего · {tasks.filter((t) => t.status === "PLANNED").length} в планах ·{" "}
              {tasks.filter((t) => t.status === "COMPLETED").length} выполнено
            </p>
          </div>
          <Button onClick={() => { setEditingTask(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Новая задача
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="PLANNED">В планах</SelectItem>
                <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
                <SelectItem value="COMPLETED">Выполнено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="HIGH">Высокий</SelectItem>
                <SelectItem value="MEDIUM">Средний</SelectItem>
                <SelectItem value="LOW">Низкий</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Дата создания</SelectItem>
                <SelectItem value="dueDate">Дедлайн</SelectItem>
                <SelectItem value="title">Название</SelectItem>
                <SelectItem value="priority">Приоритет</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            >
              {order === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "list" ? "bg-background shadow" : "hover:bg-muted/50"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Список</span>
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "kanban" ? "bg-background shadow" : "hover:bg-muted/50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Канбан</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-background shadow" : "hover:bg-muted/50"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Календарь</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : view === "list" ? (
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Задачи не найдены</p>
                <p className="text-sm mt-1">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Попробуйте изменить фильтры"
                    : "Создайте первую задачу!"}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => { setEditingTask(t); setDialogOpen(true); }}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        ) : view === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onEdit={(t) => { setEditingTask(t); setDialogOpen(true); }}
            onDelete={handleDeleteTask}
            onAddTask={(status) => {
              setEditingTask(null);
              setDialogOpen(true);
            }}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <CalendarView
            tasks={tasks}
            onEdit={(t) => { setEditingTask(t); setDialogOpen(true); }}
            onDelete={handleDeleteTask}
          />
        )}

        {/* Task Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Редактировать задачу" : "Новая задача"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => { setDialogOpen(false); setEditingTask(null); }}
              initialData={editingTask || undefined}
              submitLabel={editingTask ? "Сохранить" : "Создать"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
