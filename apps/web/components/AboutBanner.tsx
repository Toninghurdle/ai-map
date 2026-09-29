"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "fieldmap-about-dismissed";
// localStorage's own 'storage' event only fires in *other* tabs, so this
// tab's own dismissal is announced with a custom event instead (same
// pattern as components/ThemeToggle.tsx).
const CHANGE_EVENT = "fieldmap-about-dismissed-change";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // localStorage unavailable: never treat it as dismissed, so the banner
    // (and its Close button) still work for this visit.
    return false;
  }
}

function dismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Not persisted this time; the banner still closes for this render via
    // the dispatched event below.
  }
  // The same attribute app/theme-script.tsx stamps before first paint, so
  // the next load of this page hides the banner in CSS rather than painting
  // it and taking it away again.
  document.documentElement.setAttribute("data-about-dismissed", "1");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): boolean {
  // The server can't read localStorage, so the page is prerendered with the
  // banner present and the returning reader is handled before paint by
  // app/theme-script.tsx plus the "[data-about-dismissed] .fm-banner" rule
  // in globals.css. Returning false here keeps the client's first render
  // identical to the server's, so hydration doesn't warn; the real value
  // arrives from readDismissed immediately afterwards.
  return false;
}

/**
 * The "Banner" paragraph from docs/about.md, word for word (task brief item
 * 4). Rendered by app/(map)/layout.tsx (shared by "/" and the level routes
 * under /map/[level]/[slug]), but only shown on "/" itself: the layout has
 * no server-side way to tell the two apart (it doesn't read params), so this
 * client component checks the pathname itself and renders nothing on a
 * level route.
 */
export function AboutBanner() {
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(subscribe, readDismissed, getServerSnapshot);

  if (pathname !== "/" || dismissed) return null;

  return (
    <div className="fm-banner" role="note">
      <p style={{ margin: 0 }}>
        This is an early version. I built it to help people coming into AI safety and security
        get their bearings: who&apos;s working on which problems, and where there&apos;s still
        room to contribute. Most of it was compiled by AI research agents in September 2026 and
        hasn&apos;t been checked by experts yet, so treat it as a starting point and tell me when
        it&apos;s wrong.
      </p>
      <p className="fm-banner-actions">
        <Link href="/about">Read more about it</Link>
        <button type="button" onClick={dismiss}>
          Close
        </button>
      </p>
    </div>
  );
}
