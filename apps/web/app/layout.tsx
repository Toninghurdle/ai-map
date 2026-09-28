import type { Metadata } from "next";
import { ThemeScript } from "./theme-script";
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
      <body>{children}</body>
    </html>
  );
}
