import { Play, Trash2, CheckCircle2, Clock, GripVertical, RotateCcw, CalendarDays, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { Task } from "@/hooks/use-tasks";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeltaBar } from "@/components/DeltaBar";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

function SortableTask({
  task,
  activeTaskId,
  onStart,
  onDelete,
  onReset,
}: {
  task: Task;
  activeTaskId: string | null;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = task.id === activeTaskId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-sm px-4 py-3 transition-all ${
        task.status === "completed"
          ? "bg-card/50 opacity-60"
          : isActive
          ? "bg-primary/10 border border-primary/30 kairos-glow"
          : "bg-card border border-border"
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} strokeWidth={1.5} />
      </button>

      {task.status === "completed" ? (
        <CheckCircle2 size={18} strokeWidth={1.5} className="text-primary shrink-0" />
      ) : (
        <Clock size={18} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through" : ""}`}>
            {task.name}
          </p>
          {task.notes && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <StickyNote size={12} strokeWidth={1.5} className="text-primary/60 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {task.notes}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex gap-3 mt-0.5">
          {task.plannedDate && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CalendarDays size={10} strokeWidth={1.5} />
              Plan: {task.plannedDate}
            </span>
          )}
          {task.completedDate && (
            <span className="text-[11px] text-primary/70 flex items-center gap-1">
              <CheckCircle2 size={10} strokeWidth={1.5} />
              Done: {task.completedDate}
            </span>
          )}
        </div>
        {/* Delta bar: show for completed tasks */}
        {task.status === "completed" && task.actualMinutes != null && (
          <DeltaBar estimated={task.durationMinutes} actual={task.actualMinutes} />
        )}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {formatDuration(task.durationMinutes)}
      </span>

      {task.status === "completed" ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm text-muted-foreground hover:text-primary"
          onClick={() => onReset(task.id)}
          title="Reset task"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm text-primary hover:text-primary"
          onClick={() => onStart(task.id)}
        >
          <Play size={14} strokeWidth={1.5} />
        </Button>
      )}

      {task.status === "pending" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
}

export function TaskList({ tasks, activeTaskId, onStart, onDelete, onReset, onReorder }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Clock className="mx-auto mb-3 opacity-40" size={40} strokeWidth={1.5} />
        <p className="text-sm">No tasks yet. Add one above to get started.</p>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              activeTaskId={activeTaskId}
              onStart={onStart}
              onDelete={onDelete}
              onReset={onReset}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
