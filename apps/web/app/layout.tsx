import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeScript } from "./theme-script";
import { SiteFooter } from "@/components/SiteFooter";
import { LEDE } from "@/lib/lede";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Safety and Security Field Map",
    template: "%s · AI Safety and Security Field Map",
  },
  description: LEDE,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        {/* Rendered once, here, so it appears on every route (the map, its
            level pages, every detail page and /about) without each page
            having to remember it (task brief item 6). */}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
