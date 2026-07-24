"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useIsBlocked } from "@/lib/auth";
import { LogoMark } from "@/components/layout/logo";

export default function RootPage() {
  const { user, ready } = useAuth();
  const blocked = useIsBlocked(user?.teamId ?? null);
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (blocked) router.replace("/inactive");
    else router.replace("/dashboard");
  }, [ready, user, blocked, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <LogoMark size={48} />
      </div>
    </div>
  );
}
