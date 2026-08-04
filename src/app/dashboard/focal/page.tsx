"use client";

import { useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { usePomodoroStore } from "@/store/pomodoro-store";
import { useTasksStore } from "@/store/tasks-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Settings2,
  Clock,
  Target,
} from "lucide-react";
import { toast } from "sonner";

export default function FocalPage() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    currentTaskId,
    totalFocusMinutes,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    completeSession,
    setTaskId,
  } = usePomodoroStore();

  const { tasks, fetchTasks } = useTasksStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = useCallback(() => {
    const modeSeconds = usePomodoroStore.getState().modes[mode];
    return ((modeSeconds - timeLeft) / modeSeconds) * 100;
  }, [mode, timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        usePomodoroStore.setState((state) => ({
          timeLeft: state.timeLeft - 1,
        }));
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (mode === "work") {
        toast.success("🎉 Фокус-сессия завершена! Отличная работа!");
        completeSession();
      } else {
        toast.info("⏰ Перерыв закончен! Готовы к новой сессии?");
        setMode("work");
        usePomodoroStore.setState({ timeLeft: usePomodoroStore.getState().modes.work });
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, completeSession, setMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStart = () => {
    if (timeLeft === 0) {
      resetTimer();
    }
    startTimer();
  };

  const handleStop = () => {
    pauseTimer();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    pauseTimer();
    if (intervalRef.current) clearInterval(intervalRef.current);
    resetTimer();
  };

  const modeLabels = {
    work: "🎯 Фокус",
    shortBreak: "☕ Короткий перерыв",
    longBreak: "🌴 Длинный перерыв",
  };

  const modeDescriptions = {
    work: "Сфокусируйтесь на задаче",
    shortBreak: "Отдохните 5 минут",
    longBreak: "Отдохните 15 минут",
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress() / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Фокус</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Метод Pomodoro — работайте интервалами для максимальной продуктивности
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 justify-center">
          {(["work", "shortBreak", "longBreak"] as const).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              onClick={() => {
                setMode(m);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }}
            >
              {modeLabels[m]}
            </Button>
          ))}
        </div>

        {/* Timer circle */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 flex flex-col items-center">
            {/* Timer circle */}
            <div className="relative w-64 h-64 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
                <circle
                  cx="130"
                  cy="130"
                  r="120"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="120"
                  fill="none"
                  stroke={mode === "work" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-2">
                  {modeDescriptions[mode]}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={isRunning ? handleStop : handleStart}
                className="min-w-[120px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Пауза
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Старт
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset}>
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Привязать к задаче
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={currentTaskId || ""}
              onChange={(e) => setTaskId(e.target.value || null)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Без задачи</option>
              {tasks
                .filter((t) => t.status !== "COMPLETED")
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select>
            {currentTaskId && (
              <p className="text-sm text-muted-foreground mt-2">
                Сессия привязана к задаче
              </p>
            )}
          </CardContent>
        </Card>

        {/* Session info */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{sessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Сессий</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{totalFocusMinutes}</p>
              <p className="text-xs text-muted-foreground">Минут фокуса</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < sessionsCompleted % 4 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">До длинного перерыва</p>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Настройки длительности (минуты)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Фокус</label>
                <Input
                  type="number"
                  defaultValue={25}
                  min={1}
                  max={60}
                  onChange={(e) => {
                    usePomodoroStore.getState().setDuration("work", parseInt(e.target.value) || 25);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Короткий перерыв</label>
                <Input
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={30}
                  onChange={(e) => {
                    usePomodoroStore.getState().setDuration("shortBreak", parseInt(e.target.value) || 5);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Длинный перерыв</label>
                <Input
                  type="number"
                  defaultValue={15}
                  min={1}
                  max={60}
                  onChange={(e) => {
                    usePomodoroStore.getState().setDuration("longBreak", parseInt(e.target.value) || 15);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
