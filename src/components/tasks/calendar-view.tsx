"use client";

import { useState, useMemo } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@/types";

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function CalendarView({
  tasks,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const days = useMemo(() => eachDayOfInterval({ start: month, end: monthEnd }), [month, monthEnd]);
  const monthName = useMemo(
    () => format(month, "MMMM yyyy", { locale: ru }),
    [month]
  );

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dateStr = format(new Date(task.dueDate), "yyyy-MM-dd");
      if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
      tasksByDate[dateStr].push(task);
    }
  });

  const firstDayOfWeek = getDay(month);
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday start

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] bg-muted/20" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, month);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dateStr}
                className={`min-h-[100px] border-t border-l p-2 transition-colors ${
                  !isCurrentMonth ? "bg-muted/20" : ""
                } ${isCurrentDay ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentDay
                        ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                        : !isCurrentMonth
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Task pills */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onEdit(task)}
                      className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-colors hover:opacity-80 ${
                        task.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : task.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-muted-foreground pl-1.5">
                      +{dayTasks.length - 3} ещё
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
