import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";

export interface Task {
  id: string;
  name: string;
  durationMinutes: number;
  status: "pending" | "active" | "completed";
  plannedDate: string | null;
  completedDate: string | null;
  actualMinutes: number | null;
  notes: string | null;
  overtimeSeconds: number | null;
}

export interface TimerState {
  taskId: string | null;
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  isComplete: boolean;
  overtimeSeconds: number;
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
    if (raw) return { overtimeSeconds: 0, ...JSON.parse(raw) };
  } catch {}
  return { taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false, overtimeSeconds: 0 };
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

  // Countdown + overtime logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timer.taskId && !timer.isPaused) {
      if (!timer.isComplete) {
        // Count DOWN
        intervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev.remainingSeconds <= 1) {
              return { ...prev, remainingSeconds: 0, isComplete: true };
            }
            return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
          });
        }, 1000);
      } else {
        // Count UP (overtime)
        intervalRef.current = setInterval(() => {
          setTimer((prev) => ({
            ...prev,
            overtimeSeconds: prev.overtimeSeconds + 1,
          }));
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.taskId, timer.isPaused, timer.isComplete]);

  const addTask = useCallback((name: string, durationMinutes: number, plannedDate: string | null, notes: string | null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      durationMinutes,
      status: "pending",
      plannedDate: plannedDate ?? format(new Date(), "yyyy-MM-dd"),
      completedDate: null,
      actualMinutes: null,
      notes: notes || null,
      overtimeSeconds: null,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTimer((prev) => (prev.taskId === id ? { taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false, overtimeSeconds: 0 } : prev));
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
    setTimer({ taskId: id, remainingSeconds: totalSeconds, totalSeconds, isPaused: false, isComplete: false, overtimeSeconds: 0 });
  }, [tasks]);

  const completeTask = useCallback(() => {
    if (!timer.taskId) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const actualMin = Math.round((timer.totalSeconds + timer.overtimeSeconds) / 60);
    const ot = timer.overtimeSeconds;
    const taskId = timer.taskId;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed" as const, completedDate: today, actualMinutes: actualMin, overtimeSeconds: ot }
          : t
      )
    );
    setTimer({ taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false, overtimeSeconds: 0 });
  }, [timer.taskId, timer.totalSeconds, timer.overtimeSeconds]);

  const togglePause = useCallback(() => {
    setTimer((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const dismissTimer = useCallback(() => {
    setTimer({ taskId: null, remainingSeconds: 0, totalSeconds: 0, isPaused: false, isComplete: false, overtimeSeconds: 0 });
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

  const duplicateTask = useCallback((id: string, plannedDate: string) => {
    setTasks((prev) => {
      const source = prev.find((t) => t.id === id);
      if (!source) return prev;
      const dup: Task = {
        id: crypto.randomUUID(),
        name: source.name,
        durationMinutes: source.durationMinutes,
        status: "pending",
        plannedDate,
        completedDate: null,
        actualMinutes: null,
        notes: source.notes,
        overtimeSeconds: null,
      };
      return [...prev, dup];
    });
  }, []);

  return { tasks, timer, addTask, deleteTask, startTask, togglePause, dismissTimer, reorderTasks, duplicateTask, completeTask };
}
