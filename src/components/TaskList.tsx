import { useState } from "react";
import { format } from "date-fns";
import { Play, Trash2, CheckCircle2, Clock, GripVertical, Copy, CalendarDays, StickyNote, CalendarIcon, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  onDuplicate: (id: string, plannedDate: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "name" | "durationMinutes" | "plannedDate" | "notes">>) => void;
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
  onDuplicate,
  onUpdate,
}: {
  task: Task;
  activeTaskId: string | null;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, plannedDate: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "name" | "durationMinutes" | "plannedDate" | "notes">>) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dupDate, setDupDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDuration, setEditDuration] = useState(String(task.durationMinutes));
  const [editDate, setEditDate] = useState(task.plannedDate || "");
  const [editNotes, setEditNotes] = useState(task.notes || "");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = task.id === activeTaskId;

  const handleSaveEdit = () => {
    const dur = parseFloat(editDuration);
    if (!editName.trim() || isNaN(dur) || dur <= 0) return;
    onUpdate(task.id, {
      name: editName.trim(),
      durationMinutes: dur,
      plannedDate: editDate || null,
      notes: editNotes.trim() || null,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(task.name);
    setEditDuration(String(task.durationMinutes));
    setEditDate(task.plannedDate || "");
    setEditNotes(task.notes || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Name</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-background" />
          </div>
          <div className="w-24">
            <label className="text-xs text-muted-foreground mb-1 block">Minutes</label>
            <Input type="number" min="1" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="bg-background" />
          </div>
          <div className="w-36">
            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-background" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
          <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="bg-background min-h-[50px] text-sm" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
            <X size={14} className="mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSaveEdit}>
            <Check size={14} className="mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg px-5 py-4 transition-all ${
        task.status === "completed"
          ? "bg-card/50 opacity-60 border border-border"
          : isActive
          ? "bg-primary/10 border border-primary/30 kairos-glow"
          : "bg-card border border-border"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} strokeWidth={1.5} />
        </button>

        {task.status === "completed" ? (
          <CheckCircle2 size={22} strokeWidth={1.5} className="text-primary shrink-0" />
        ) : (
          <Clock size={22} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-base font-semibold truncate ${task.status === "completed" ? "line-through" : ""}`}>
              {task.name}
            </p>
            {task.notes && (
              <button
                onClick={() => setNotesExpanded((v) => !v)}
                className="text-primary/60 hover:text-primary transition-colors shrink-0"
              >
                <StickyNote size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            {task.plannedDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays size={11} strokeWidth={1.5} />
                Plan: {task.plannedDate}
              </span>
            )}
            {task.completedDate && (
              <span className="text-xs text-primary/70 flex items-center gap-1">
                <CheckCircle2 size={11} strokeWidth={1.5} />
                Done: {task.completedDate}
              </span>
            )}
          </div>
          {/* Expanded notes */}
          {notesExpanded && task.notes && (
            <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 border border-border/50">
              {task.notes}
            </div>
          )}
          {task.status === "completed" && task.actualMinutes != null && (
            <DeltaBar estimated={task.durationMinutes} actual={task.actualMinutes} />
          )}
        </div>

        <span className="text-sm text-muted-foreground tabular-nums shrink-0 font-medium">
          {formatDuration(task.durationMinutes)}
        </span>

        {task.status === "pending" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
            title="Edit task"
          >
            <Pencil size={15} strokeWidth={1.5} />
          </Button>
        )}

        {task.status !== "pending" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-muted-foreground hover:text-primary"
            onClick={() => setShowDatePicker((v) => !v)}
            title="Duplicate task"
          >
            <Copy size={15} strokeWidth={1.5} />
          </Button>
        )}

        {task.status === "pending" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-primary hover:text-primary"
            onClick={() => onStart(task.id)}
          >
            <Play size={15} strokeWidth={1.5} />
          </Button>
        )}

        {/* Inline date picker for duplication */}
        {showDatePicker && (
          <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-md p-3 shadow-lg flex items-center gap-2">
            <CalendarIcon size={12} strokeWidth={1.5} className="text-muted-foreground" />
            <input
              type="date"
              value={dupDate}
              onChange={(e) => setDupDate(e.target.value)}
              className="bg-background border border-border rounded-sm text-xs px-2 py-1 text-foreground"
            />
            <Button
              size="sm"
              className="rounded-sm text-xs h-7 px-2"
              onClick={() => {
                onDuplicate(task.id, dupDate);
                setShowDatePicker(false);
              }}
            >
              Duplicate
            </Button>
          </div>
        )}

        {task.status === "pending" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </Button>
        )}
      </div>
    </div>
  );
}

export function TaskList({ tasks, activeTaskId, onStart, onDelete, onDuplicate, onReorder, onUpdate }: TaskListProps) {
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
        <div className="space-y-3">
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              activeTaskId={activeTaskId}
              onStart={onStart}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
