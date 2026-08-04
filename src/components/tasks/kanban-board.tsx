import TaskCard from "./task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask: (status?: Task["status"]) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

const COLUMNS: {
  status: Task["status"];
  title: string;
  icon: string;
  color: string;
}[] = [
  { status: "PLANNED", title: "В планах", icon: "📋", color: "border-blue-500" },
  { status: "IN_PROGRESS", title: "В процессе", icon: "⚡", color: "border-amber-500" },
  { status: "COMPLETED", title: "Выполнено", icon: "✅", color: "border-green-500" },
];

export default function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onAddTask,
  onStatusChange,
}: KanbanBoardProps) {
  const getTasksByStatus = (status: Task["status"]) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        return (
          <div key={column.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{column.icon}</span>
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              <button
                onClick={() => onAddTask(column.status)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Добавить задачу"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`space-y-3 min-h-[200px] p-3 rounded-lg border-2 border-dashed border-muted/50 ${
                columnTasks.length > 0 ? "border-none p-0" : ""
              }`}
            >
              {columnTasks.map((task) => (
                <div key={task.id} className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    task.priority === "HIGH" ? "bg-red-500" :
                    task.priority === "MEDIUM" ? "bg-amber-500" : "bg-green-500"
                  }`} />
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                  <span className="text-2xl mb-2">{column.icon}</span>
                  Нет задач
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
