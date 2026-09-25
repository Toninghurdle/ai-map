"use client";

import { useSyncExternalStore } from "react";

type ThemeChoice = "auto" | "light" | "dark";

const STORAGE_KEY = "fieldmap-theme";
// localStorage's own 'storage' event only fires in *other* tabs, so this
// tab's own writes are announced with a custom event instead.
const CHANGE_EVENT = "fieldmap-theme-change";

const NEXT: Record<ThemeChoice, ThemeChoice> = {
  auto: "light",
  light: "dark",
  dark: "auto",
};
const LABEL: Record<ThemeChoice, string> = {
  auto: "Auto",
  light: "Light",
  dark: "Dark",
};

function readStoredTheme(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable: fall through to Auto.
  }
  return "auto";
}

function applyTheme(choice: ThemeChoice) {
  if (choice === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", choice);
  }
  try {
    if (choice === "auto") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Not persisted this time; the button still works for the session.
  }
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

function getServerSnapshot(): ThemeChoice {
  return "auto";
}

/**
 * Cycles Auto, Light and Dark (docs/design/04-interaction.md "Theme").
 * Reads localStorage through useSyncExternalStore rather than an effect, so
 * the first client render matches the server ("Auto") without a flash and
 * without a manual setState-after-mount.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, getServerSnapshot);

  function cycle() {
    applyTheme(NEXT[theme]);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="fm-theme-btn"
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
    >
      {LABEL[theme]}
    </button>
  );
}
