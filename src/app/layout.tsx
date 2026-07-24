import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "ScoutIQ — Football Scouting Intelligence",
  description:
    "ScoutIQ — a professional football scouting and recruitment management platform.",
  applicationName: "ScoutIQ",
  manifest: withBasePath("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: withBasePath("/icons/icon.svg"), type: "image/svg+xml" },
      { url: withBasePath("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: withBasePath("/icons/apple-touch-icon.png"), sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "ScoutIQ",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#11151c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen antialiased scrollbar-thin">
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
