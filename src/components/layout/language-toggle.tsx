"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, toggleLang, t } = useI18n();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          onClick={toggleLang}
          aria-label={t("top.language")}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {!compact && (
            <span className="font-medium">
              {lang === "he" ? "EN" : "עב"}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {lang === "he" ? "Switch to English" : "החלף לעברית"}
      </TooltipContent>
    </Tooltip>
  );
}
