"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth, useIsBlocked } from "@/lib/auth";
import { isAllowed } from "@/lib/nav";
import { LogoMark } from "@/components/layout/logo";
import { NoAccess } from "@/components/common/no-access";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const blocked = useIsBlocked(user?.teamId ?? null);
  const router = useRouter();
  const pathname = usePathname();

  // Only auth-level problems redirect away. Insufficient role does NOT redirect —
  // it renders a visible "no access" block inside the app shell.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (blocked) {
      router.replace("/inactive");
    }
  }, [ready, user, blocked, router]);

  if (!ready || !user || blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">
          <LogoMark size={48} />
        </div>
      </div>
    );
  }

  const allowed = isAllowed(pathname, user.role);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            {allowed ? children : <NoAccess />}
          </div>
        </main>
      </div>
    </div>
  );
}
