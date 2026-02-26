import { useState, useEffect, useCallback, useRef } from "react";

export interface Task {
  id: string;
  name: string;
  durationMinutes: number;
  status: "pending" | "active" | "completed";
}

export interface TimerState {
  taskId: string | null;
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  isComplete: boolean;
}

const TASKS_KEY = "timeboxed-tasks";
const TIMER_KEY = "timeboxed-timer";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadTimer(): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [timer, setTimer] = useState<TimerState>(loadTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Persist timer
  useEffect(() => {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  }, [timer]);

  // Countdown logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timer.taskId && !timer.isPaused && !timer.isComplete) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Timer complete
            return { ...prev, remainingSeconds: 0, isComplete: true };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.taskId, timer.isPaused, timer.isComplete]);

  // Mark task completed when timer finishes
  useEffect(() => {
    if (timer.isComplete && timer.taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === timer.taskId ? { ...t, status: "completed" } : t))
      );
    }
  }, [timer.isComplete, timer.taskId]);

  const addTask = useCallback((name: string, durationMinutes: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      durationMinutes,
      status: "pending",
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTimer((prev) => (prev.taskId === id ? { taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false } : prev));
  }, []);

  const startTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) return { ...t, status: "active" as const };
        if (t.status === "active") return { ...t, status: "pending" as const };
        return t;
      })
    );
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const totalSeconds = task.durationMinutes * 60;
    setTimer({ taskId: id, remainingSeconds: totalSeconds, totalSeconds, isPaused: false, isComplete: false });
  }, [tasks]);

  const togglePause = useCallback(() => {
    setTimer((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const dismissTimer = useCallback(() => {
    setTimer({ taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false });
  }, []);

  const reorderTasks = useCallback((activeId: string, overId: string) => {
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, []);

  const resetTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "pending" as const } : t)));
  }, []);

  return { tasks, timer, addTask, deleteTask, startTask, togglePause, dismissTimer, reorderTasks, resetTask };
}
