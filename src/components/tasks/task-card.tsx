import { formatDate, getPriorityColor, getPriorityBadge, getStatusLabel, isOverdue } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: Task["status"]) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Priority indicator */}
          <div
            className={`w-1 h-full min-h-[40px] rounded-full flex-shrink-0 ${
              task.priority === "HIGH"
                ? "bg-red-500"
                : task.priority === "MEDIUM"
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium truncate ${
                    task.status === "COMPLETED"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(task)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`${getPriorityColor(task.priority)} border-0 text-xs`}
              >
                {getPriorityBadge(task.priority)}
              </Badge>

              <Badge
                variant="outline"
                className="text-xs border-muted-foreground/30"
              >
                {getStatusLabel(task.status)}
              </Badge>

              {task.dueDate && (
                <span
                  className={`text-xs ${
                    isOverdue(new Date(task.dueDate), task.status)
                      ? "text-red-500 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  📅 {formatDate(task.dueDate)}
                </span>
              )}

              {task.tags.length > 0 &&
                task.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-muted/50"
                  >
                    {tag}
                  </Badge>
                ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Subtasks progress */}
            {totalSubtasks > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {completedSubtasks}/{totalSubtasks} подзадач
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Expand subtasks */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Подзадачи
              </button>
            )}

            {/* Subtasks list */}
            {expanded && task.subtasks && (
              <div className="mt-2 space-y-1">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        subtask.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {subtask.completed && (
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`${
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
