import { useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Clock, TrendingUp } from "lucide-react";
import type { Task } from "@/hooks/use-tasks";

interface AnalyticsProps {
  tasks: Task[];
}

export function Analytics({ tasks }: AnalyticsProps) {
  const completed = useMemo(() => tasks.filter((t) => t.status === "completed" && t.actualMinutes != null), [tasks]);

  const timeAccuracy = useMemo(() => {
    if (completed.length === 0) return 0;
    const onTime = completed.filter((t) => (t.actualMinutes ?? 0) <= t.durationMinutes).length;
    return Math.round((onTime / completed.length) * 100);
  }, [completed]);

  const totalFocused = useMemo(() => completed.reduce((sum, t) => sum + (t.actualMinutes ?? 0), 0), [completed]);

  const avgDelta = useMemo(() => {
    if (completed.length === 0) return 0;
    const totalDelta = completed.reduce((sum, t) => sum + ((t.actualMinutes ?? 0) - t.durationMinutes), 0);
    return Math.round(totalDelta / completed.length);
  }, [completed]);

  // Last 7 days chart data
  const chartData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const label = format(date, "MMM d");
      const dayTasks = completed.filter((t) => t.completedDate === dateStr);
      const planned = dayTasks.reduce((s, t) => s + t.durationMinutes, 0);
      const actual = dayTasks.reduce((s, t) => s + (t.actualMinutes ?? 0), 0);
      const overtime = Math.max(0, actual - planned);
      return { label, planned, overtime };
    });
    return days;
  }, [completed]);

  const formatHours = (min: number) => {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-sm bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
              <Target size={12} strokeWidth={1.5} /> Time Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold tabular-nums">{timeAccuracy}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.5} /> Total Focused
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold tabular-nums">{formatHours(totalFocused)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
              <TrendingUp size={12} strokeWidth={1.5} /> Avg Delta
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className={`text-2xl font-bold tabular-nums ${avgDelta > 0 ? "text-destructive" : "text-primary"}`}>
              {avgDelta > 0 ? "+" : ""}{avgDelta}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="rounded-sm bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Planned vs Actual — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Complete some tasks to see your analytics.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "2px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [`${value}m`, name === "planned" ? "Planned" : "Overtime"]}
                />
                <Bar dataKey="planned" stackId="a" fill="hsl(38, 92%, 50%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="overtime" stackId="a" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
