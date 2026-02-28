import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTask } from "@/components/SortableTask";
import { Clock } from "lucide-react";
import type { Task } from "@/hooks/use-tasks";

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  activeTaskId: string | null;
  isFuture?: boolean;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, plannedDate: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "name" | "durationMinutes" | "plannedDate" | "notes">>) => void;
}

export function TaskColumn({
  id,
  title,
  tasks,
  activeTaskId,
  isFuture = false,
  onStart,
  onDelete,
  onDuplicate,
  onUpdate,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold mb-3 text-foreground">{title}</h2>
      <div
        ref={setNodeRef}
        className={`min-h-[120px] rounded-lg border-2 border-dashed p-3 transition-colors ${
          isOver ? "border-primary/50 bg-primary/5" : "border-transparent"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto mb-2 opacity-30" size={28} strokeWidth={1.5} />
                <p className="text-sm">No tasks</p>
              </div>
            ) : (
              tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  activeTaskId={activeTaskId}
                  isFuture={isFuture}
                  onStart={onStart}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
