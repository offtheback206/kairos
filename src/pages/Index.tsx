import { useTasks } from "@/hooks/use-tasks";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Analytics } from "@/components/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kairosLogo from "@/assets/Kairos.png";

const Index = () => {
  const { tasks, timer, addTask, deleteTask, startTask, togglePause, dismissTimer, reorderTasks, duplicateTask, completeTask } = useTasks();
  const activeTask = tasks.find((t) => t.id === timer.taskId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <img src={kairosLogo} alt="Kairos" className="h-14 w-14 object-contain" />
            <h1 className="text-3xl font-bold tracking-tight">Kairos</h1>
          </div>
          <p className="text-sm text-muted-foreground">Seize the opportune moment.</p>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full mb-6 rounded-sm">
            <TabsTrigger value="tasks" className="flex-1 rounded-sm text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-sm text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            {/* Active Timer */}
            <TimerDisplay
              timer={timer}
              task={activeTask}
              onTogglePause={togglePause}
              onDismiss={dismissTimer}
              onComplete={completeTask}
            />

            {/* Task Input */}
            <section className="mb-8 mt-10">
              <TaskForm onAdd={addTask} />
            </section>

            {/* Task List */}
            <section>
              <TaskList
                tasks={tasks}
                activeTaskId={timer.taskId}
                onStart={startTask}
                onDelete={deleteTask}
                onDuplicate={duplicateTask}
                onReorder={reorderTasks}
              />
            </section>
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
