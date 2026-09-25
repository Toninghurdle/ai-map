import type { Metadata } from "next";
import { ThemeScript } from "./theme-script";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const LEDE =
  "Every hex is a problem someone could work on. Pink means nobody is working on it yet, gold a little work, green active and dark forest busy. A small token says who holds it: a pink ring for frontier labs only, a blue dot for another field.";

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
