import { useEffect } from "react";
import { Pause, Play, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { TimerState, Task } from "@/hooks/use-tasks";

interface TimerDisplayProps {
  timer: TimerState;
  task: Task | undefined;
  onTogglePause: () => void;
  onDismiss: () => void;
  onComplete: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerDisplay({ timer, task, onTogglePause, onDismiss, onComplete }: TimerDisplayProps) {
  const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
  const isOvertime = timer.isComplete;

  useEffect(() => {
    if (isOvertime && timer.overtimeSeconds === 0) {
      toast({
        title: "Time's up!",
        description: `"${task?.name}" — Complete or enter overtime.`,
      });
    }
  }, [isOvertime, timer.overtimeSeconds, task?.name]);

  if (!timer.taskId) return null;

  const radius = 155;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isOvertime ? 0 : circumference * (1 - progress);

  function getRingColor(p: number) {
    if (isOvertime) return "hsl(0, 84%, 60%)";
    if (p > 0.66) return "hsl(142, 71%, 45%)";
    if (p > 0.33) return "hsl(48, 96%, 53%)";
    return "hsl(0, 84%, 60%)";
  }

  return (
    <div className={`flex flex-col items-center py-8 transition-colors duration-700 ${
      isOvertime ? "kairos-alert-glow rounded-sm" : "kairos-glow-strong rounded-sm"
    }`}>
      {/* Progress ring */}
      <div className="relative w-96 h-96 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="200" cy="200" r={radius} fill="none"
            stroke={getRingColor(progress)}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isOvertime ? (
            <>
              <span className="text-xs font-semibold text-destructive mb-1 tracking-widest uppercase">Overtime</span>
              <span className="text-5xl font-mono font-bold tabular-nums text-destructive">
                +{formatTime(timer.overtimeSeconds)}
              </span>
            </>
          ) : (
            <>
              <span className={`text-5xl font-mono font-bold tabular-nums ${isOvertime ? "text-destructive" : "text-primary"}`}>
                {formatTime(timer.remainingSeconds)}
              </span>
              {timer.isPaused && (
                <span className="text-xs text-muted-foreground mt-1">Paused</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task name */}
      <p className="text-3xl font-bold text-foreground mb-5 truncate max-w-lg animate-fade-in tracking-tight">{task?.name}</p>

      {/* Controls */}
      <div className="flex gap-2">
        {isOvertime ? (
          <Button variant="default" size="sm" className="rounded-sm" onClick={onComplete}>
            <CheckCircle2 size={14} strokeWidth={1.5} className="mr-1" />
            Complete Task
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-sm" onClick={onTogglePause}>
            {timer.isPaused ? <Play size={14} strokeWidth={1.5} className="mr-1" /> : <Pause size={14} strokeWidth={1.5} className="mr-1" />}
            {timer.isPaused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button variant="ghost" size="sm" className="rounded-sm" onClick={onDismiss}>
          <X size={14} strokeWidth={1.5} className="mr-1" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}
