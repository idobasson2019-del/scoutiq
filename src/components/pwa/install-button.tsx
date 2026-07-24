"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shown only when the browser offers installation (Chrome/Edge fire
 * `beforeinstallprompt`). Once installed, or in browsers without the event,
 * the button renders nothing rather than promising something that can't happen.
 */
export function InstallAppButton() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      toast(t("top.installed"));
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [t, toast]);

  if (!deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // The event is single-use; drop it either way.
    setDeferred(null);
    if (outcome === "accepted") toast(t("top.installed"));
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={install} aria-label={t("top.install")}>
          <Download className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("top.install")}</TooltipContent>
    </Tooltip>
  );
}
