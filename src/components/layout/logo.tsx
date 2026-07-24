"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
      <path
        d="M16 6.5 24.5 11v6.2c0 5-3.6 7.6-8.5 9.3-4.9-1.7-8.5-4.3-8.5-9.3V11L16 6.5Z"
        fill="hsl(var(--primary-foreground))"
        fillOpacity="0.16"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="15.4" r="3.1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.4" />
      <path d="M16 12.3v-1.6M16 20.1v-1.6M12.9 15.4h-1.6M20.7 15.4h-1.6" stroke="hsl(var(--primary-foreground))" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  showTagline = true,
  className,
}: {
  showTagline?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={34} />
      <div className="leading-tight">
        <div className="text-[17px] font-semibold tracking-tight text-foreground">
          Scout<span className="text-primary">IQ</span>
        </div>
        {showTagline && (
          <div className="text-[11px] text-muted-foreground">
            {t("brand.tagline")}
          </div>
        )}
      </div>
    </div>
  );
}
