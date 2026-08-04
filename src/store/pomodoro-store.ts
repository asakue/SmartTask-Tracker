import { create } from "zustand";

type PomodoroMode = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  currentTaskId: string | null;
  totalFocusMinutes: number;

  modes: Record<PomodoroMode, number>;

  setMode: (mode: PomodoroMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (mode: PomodoroMode, minutes: number) => void;
  setTaskId: (taskId: string | null) => void;
  completeSession: () => void;
}

export const usePomodoroStore = create<PomodoroState>()((set, get) => ({
  mode: "work",
  timeLeft: 1500, // 25 minutes in seconds
  isRunning: false,
  sessionsCompleted: 0,
  currentTaskId: null,
  totalFocusMinutes: 0,

  modes: {
    work: 1500,
    shortBreak: 300,
    longBreak: 900,
  },

  setMode: (mode) => {
    const duration = get().modes[mode];
    set({ mode, timeLeft: duration, isRunning: false });
  },

  startTimer: () => {
    set({ isRunning: true });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resetTimer: () => {
    const duration = get().modes[get().mode];
    set({ timeLeft: duration, isRunning: false });
  },

  setDuration: (mode, minutes) => {
    const seconds = minutes * 60;
    set((state) => ({
      modes: {
        ...state.modes,
        [mode]: seconds,
      },
      ...(state.mode === mode ? { timeLeft: seconds, isRunning: false } : {}),
    }));
  },

  setTaskId: (taskId) => {
    set({ currentTaskId: taskId });
  },

  completeSession: () => {
    const state = get();
    const newSessions = state.sessionsCompleted + 1;
    const newTotalMinutes = state.totalFocusMinutes + Math.round(state.modes.work / 60);

    set({
      sessionsCompleted: newSessions,
      totalFocusMinutes: newTotalMinutes,
      isRunning: false,
      timeLeft: state.modes.work,
    });

    // Auto switch to break after work, or work after break
    if (state.mode === "work" && newSessions % 4 === 0) {
      set({ mode: "longBreak", timeLeft: state.modes.longBreak });
    } else if (state.mode === "work") {
      set({ mode: "shortBreak", timeLeft: state.modes.shortBreak });
    } else {
      set({ mode: "work", timeLeft: state.modes.work });
    }
  },
}));
