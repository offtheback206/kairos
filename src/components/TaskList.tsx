import { useMemo } from "react";
import { format } from "date-fns";
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskColumn } from "@/components/TaskColumn";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, plannedDate: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "name" | "durationMinutes" | "plannedDate" | "notes">>) => void;
}

export function TaskList({ tasks, activeTaskId, onStart, onDelete, onDuplicate, onReorder, onUpdate }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const today = format(new Date(), "yyyy-MM-dd");

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.plannedDate === today),
    [tasks, today]
  );
  const futureTasks = useMemo(
    () => tasks.filter((t) => t.plannedDate !== today),
    [tasks, today]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    const isInToday = todayTasks.some((t) => t.id === activeId);

    // Dropped on a column droppable (empty column)
    if (overId === "column-today" || overId === "column-future") {
      const targetIsToday = overId === "column-today";
      const alreadyCorrect = targetIsToday ? isInToday : !isInToday;
      if (!alreadyCorrect && draggedTask.status === "pending") {
        const newDate = targetIsToday ? today : format(new Date(Date.now() + 86400000), "yyyy-MM-dd");
        onUpdate(activeId, { plannedDate: newDate });
      }
      return;
    }

    // Dropped on another task
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    const overIsInToday = todayTasks.some((t) => t.id === overId);

    if (isInToday !== overIsInToday && draggedTask.status === "pending") {
      // Cross-column move: update date
      const newDate = overIsInToday ? today : (overTask.plannedDate || format(new Date(Date.now() + 86400000), "yyyy-MM-dd"));
      onUpdate(activeId, { plannedDate: newDate });
    }

    if (activeId !== overId) {
      onReorder(activeId, overId);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No tasks yet. Add one above to get started.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskColumn
          id="column-today"
          title="Today"
          tasks={todayTasks}
          activeTaskId={activeTaskId}
          onStart={onStart}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onUpdate={onUpdate}
        />
        <TaskColumn
          id="column-future"
          title="Future Tasks"
          tasks={futureTasks}
          activeTaskId={activeTaskId}
          isFuture
          onStart={onStart}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onUpdate={onUpdate}
        />
      </div>
    </DndContext>
  );
}
