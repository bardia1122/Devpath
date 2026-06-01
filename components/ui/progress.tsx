import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number; // 0–100
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-zinc-800",
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
