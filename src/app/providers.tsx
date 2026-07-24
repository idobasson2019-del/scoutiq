"use client";

import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { UsersProvider } from "@/lib/users-store";
import { TeamsProvider } from "@/lib/teams-store";
import { PlayersProvider } from "@/lib/players-store";
import { NeedsProvider } from "@/lib/needs-store";
import { ReportsProvider } from "@/lib/reports-store";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <UsersProvider>
        <TeamsProvider>
          <AuthProvider>
            <PlayersProvider>
              <NeedsProvider>
                <ReportsProvider>
                  <ToastProvider>
                    <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
                  </ToastProvider>
                </ReportsProvider>
              </NeedsProvider>
            </PlayersProvider>
          </AuthProvider>
        </TeamsProvider>
      </UsersProvider>
    </LanguageProvider>
  );
}
