import { useEffect } from "react";
import { Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { TimerState, Task } from "@/hooks/use-tasks";

interface TimerDisplayProps {
  timer: TimerState;
  task: Task | undefined;
  onTogglePause: () => void;
  onDismiss: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerDisplay({ timer, task, onTogglePause, onDismiss }: TimerDisplayProps) {
  const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
  const isAlert = timer.isComplete;

  // Show toast when timer completes
  useEffect(() => {
    if (isAlert) {
      toast({
        title: "Time's up!",
        description: `"${task?.name}" is done. Move on to your next task.`,
      });
    }
  }, [isAlert, task?.name]);

  if (!timer.taskId) return null;

  const radius = 155;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Green → Yellow → Orange → Red as time runs down
  function getRingColor(p: number) {
    if (isAlert) return "hsl(0, 55%, 48%)";
    const hue = Math.round(p * 120); // 120=green, 0=red
    return `hsl(${hue}, 65%, 48%)`;
  }

  return (
    <div className={`flex flex-col items-center py-8 transition-colors duration-700 ${isAlert ? "text-destructive" : ""}`}>
      {/* Progress ring */}
      <div className="relative w-96 h-96 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 400 400">
          <circle
            cx="200"
            cy="200"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          <circle
            cx="200"
            cy="200"
            r={radius}
            fill="none"
            stroke={getRingColor(progress)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold tabular-nums">
            {formatTime(timer.remainingSeconds)}
          </span>
          {timer.isPaused && !isAlert && (
            <span className="text-xs text-muted-foreground mt-1">Paused</span>
          )}
          {isAlert && (
            <span className="text-xs font-medium mt-1">Complete</span>
          )}
        </div>
      </div>

      {/* Task name */}
      <p className="text-sm text-muted-foreground mb-4 truncate max-w-xs">{task?.name}</p>

      {/* Controls */}
      <div className="flex gap-2">
        {!isAlert && (
          <Button variant="outline" size="sm" onClick={onTogglePause}>
            {timer.isPaused ? <Play size={14} className="mr-1" /> : <Pause size={14} className="mr-1" />}
            {timer.isPaused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <X size={14} className="mr-1" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}
