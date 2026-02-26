import { Play, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/hooks/use-tasks";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

export function TaskList({ tasks, activeTaskId, onStart, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Clock className="mx-auto mb-3 opacity-40" size={40} />
        <p className="text-sm">No tasks yet. Add one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
            task.status === "completed"
              ? "bg-card/50 opacity-60"
              : task.id === activeTaskId
              ? "bg-primary/10 border border-primary/20"
              : "bg-card border border-border"
          }`}
        >
          {task.status === "completed" ? (
            <CheckCircle2 size={18} className="text-primary shrink-0" />
          ) : (
            <Clock size={18} className="text-muted-foreground shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through" : ""}`}>
              {task.name}
            </p>
          </div>

          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {formatDuration(task.durationMinutes)}
          </span>

          {task.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary"
              onClick={() => onStart(task.id)}
            >
              <Play size={14} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
    </div>
  );
}
