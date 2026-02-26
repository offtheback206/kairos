import { useTasks } from "@/hooks/use-tasks";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Clock } from "lucide-react";

const Index = () => {
  const { tasks, timer, addTask, deleteTask, startTask, togglePause, dismissTimer, reorderTasks, resetTask } = useTasks();
  const activeTask = tasks.find((t) => t.id === timer.taskId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={20} className="text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">Time-Boxed Planner</h1>
          </div>
          <p className="text-xs text-muted-foreground">Focus on one task at a time.</p>
        </header>

        {/* Active Timer */}
        <TimerDisplay
          timer={timer}
          task={activeTask}
          onTogglePause={togglePause}
          onDismiss={dismissTimer}
        />

        {/* Task Input */}
        <section className="mb-8">
          <TaskForm onAdd={addTask} />
        </section>

        {/* Task List */}
        <section>
          <TaskList
            tasks={tasks}
            activeTaskId={timer.taskId}
            onStart={startTask}
            onDelete={deleteTask}
            onReset={resetTask}
            onReorder={reorderTasks}
          />
        </section>
      </div>
    </div>
  );
};

export default Index;
