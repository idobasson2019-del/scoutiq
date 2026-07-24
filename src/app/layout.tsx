import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ScoutIQ — Football Scouting Intelligence",
  description:
    "ScoutIQ — a professional football scouting and recruitment management platform.",
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
      </body>
    </html>
  );
}
