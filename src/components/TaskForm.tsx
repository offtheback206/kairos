import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFormProps {
  onAdd: (name: string, durationMinutes: number) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseFloat(duration);
    if (!name.trim() || isNaN(dur) || dur <= 0) return;
    const minutes = unit === "hours" ? dur * 60 : dur;
    onAdd(name.trim(), minutes);
    setName("");
    setDuration("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground mb-1.5 block">Task name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What are you working on?"
          className="bg-card border-border"
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
          className="bg-card border-border"
        />
      </div>
      <div className="w-28">
        <label className="text-xs text-muted-foreground mb-1.5 block">Unit</label>
        <Select value={unit} onValueChange={(v) => setUnit(v as "minutes" | "hours")}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="default" className="shrink-0">
        <Plus className="mr-1" size={16} />
        Add
      </Button>
    </form>
  );
}
