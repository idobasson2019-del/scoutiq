"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/base-path";

/**
 * Registers the service worker so the app can be installed to the home screen
 * and reopens offline. Renders nothing.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const register = () => {
      navigator.serviceWorker
        .register(withBasePath("/sw.js"), { scope: withBasePath("/") })
        .catch(() => {
          // Installability is a bonus — never let a failed registration break the app.
        });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
