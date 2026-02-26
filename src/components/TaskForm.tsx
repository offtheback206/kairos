import { useState } from "react";
import { format } from "date-fns";
import { Plus, CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onAdd: (name: string, durationMinutes: number, plannedDate: string | null, notes: string | null) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes");
  const [plannedDate, setPlannedDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseFloat(duration);
    if (!name.trim() || isNaN(dur) || dur <= 0) return;
    const minutes = unit === "hours" ? dur * 60 : dur;
    const dateStr = plannedDate ? format(plannedDate, "yyyy-MM-dd") : null;
    onAdd(name.trim(), minutes, dateStr, notes.trim() || null);
    setName("");
    setDuration("");
    setNotes("");
    setNotesOpen(false);
    setPlannedDate(new Date());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">Task name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What are you working on?"
            className="bg-card border-border rounded-sm"
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-muted-foreground mb-1.5 block">Duration</label>
          <Input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
            className="bg-card border-border rounded-sm"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-muted-foreground mb-1.5 block">Unit</label>
          <Select value={unit} onValueChange={(v) => setUnit(v as "minutes" | "hours")}>
            <SelectTrigger className="bg-card border-border rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Focus Notes (collapsible) */}
      <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown size={12} strokeWidth={1.5} className={cn("transition-transform", notesOpen && "rotate-180")} />
            Focus Notes
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What should you focus on? Key objectives, blockers..."
            className="bg-card border-border rounded-sm min-h-[60px] text-sm"
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Planned date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal bg-card border-border rounded-sm",
                  !plannedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                {plannedDate ? format(plannedDate, "MMM d, yyyy") : "Today"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={plannedDate}
                onSelect={setPlannedDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" size="default" className="shrink-0 rounded-sm">
          <Plus className="mr-1" size={16} strokeWidth={1.5} />
          Add Task
        </Button>
      </div>
    </form>
  );
}
