"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <Card
      className={cn(
        "flex items-center gap-4 p-4 transition-colors",
        href && "hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold tabular-nums leading-none">{value}</div>
        <div className="mt-1 truncate text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
