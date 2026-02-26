interface DeltaBarProps {
  estimated: number; // minutes
  actual: number;    // minutes
}

export function DeltaBar({ estimated, actual }: DeltaBarProps) {
  const max = Math.max(estimated, actual, 1);
  const estPct = (estimated / max) * 100;
  const actPct = (actual / max) * 100;
  const isOver = actual > estimated;

  return (
    <div className="mt-1.5">
      <div className="relative h-2 w-full rounded-sm bg-muted overflow-hidden">
        {/* Ghost fill: estimated */}
        <div
          className="absolute inset-y-0 left-0 rounded-sm bg-primary/20"
          style={{ width: `${estPct}%` }}
        />
        {/* Solid fill: actual */}
        <div
          className={`absolute inset-y-0 left-0 rounded-sm transition-all ${
            isOver ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${actPct}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-muted-foreground">Est: {estimated}m</span>
        <span className={`text-[10px] font-medium ${isOver ? "text-destructive" : "text-primary"}`}>
          Act: {actual}m {isOver ? `(+${actual - estimated}m)` : ""}
        </span>
      </div>
    </div>
  );
}
