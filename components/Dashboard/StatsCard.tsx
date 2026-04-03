import type { StatCardProps } from "@/types";

const accentClasses = {
  orange: "text-pow-accent",
  green: "text-pow-green",
  muted: "text-pow-text",
  red: "text-red-400",
};

export default function StatsCard({
  label,
  value,
  accent,
  icon,
  loading = false,
}: StatCardProps) {
  return (
    <div className="rounded-xl p-4 space-y-1 bg-pow-card border border-pow-border">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-pow-muted">
          {label}
        </p>
        <span className="text-lg">{icon}</span>
      </div>
      {loading ? (
        <div className="h-6 rounded animate-pulse bg-pow-border" />
      ) : (
        <p
          className={`text-xl font-bold leading-tight font-mono ${accentClasses[accent]}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
