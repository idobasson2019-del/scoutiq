"use client";

import { type LucideIcon } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {body && (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Colored monogram used in place of a real photo. If `imageUrl` is provided,
 * the actual photo is shown instead (same size/shape).
 */
export function Monogram({
  name,
  color,
  size = 40,
  square = false,
  imageUrl,
}: {
  name: string;
  color: string;
  size?: number;
  square?: boolean;
  imageUrl?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className={cn(
          "shrink-0 border border-border object-cover",
          square ? "rounded-md" : "rounded-full",
        )}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold text-white/90",
        square ? "rounded-md" : "rounded-full",
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/** Team crest: shows the logo image if provided, else a colored monogram. */
export function TeamLogo({
  name,
  color,
  logoUrl,
  size = 40,
}: {
  name: string;
  color: string;
  logoUrl?: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-md border border-border bg-white/5 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return <Monogram name={name} color={color} size={size} square />;
}

export function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const color =
    value >= 82 ? "hsl(var(--success))" : value >= 72 ? "hsl(var(--primary))" : "hsl(var(--warning))";
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3.5} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={3.5}
          strokeLinecap="round"
          className="fill-none"
          style={{ stroke: color, strokeDasharray: c, strokeDashoffset: c * (1 - pct), transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold"
        style={{ fontSize: size * 0.3 }}
      >
        {value}
      </span>
    </div>
  );
}

export function StatBar({
  label: lbl,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    value >= 82 ? "bg-success" : value >= 70 ? "bg-primary" : "bg-warning";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{lbl}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
