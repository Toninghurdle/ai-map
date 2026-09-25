"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  FieldMapData,
  FieldMapLevel,
  FieldMapNavigateEvent,
} from "@ai-map/fieldmap";
// Written by apps/web/scripts/copy-fieldmap.mjs (predev, prebuild) from
// packages/fieldmap/src/fieldmap.{js,css}; gitignored build output, see
// .gitignore.
import fieldmapManifest from "../fieldmap-manifest.json";

const SCRIPT_SRC = `/${fieldmapManifest.js}`;
const SCRIPT_ID = "fieldmap-script";
const LEVELS: FieldMapLevel[] = ["layer", "area", "node", "org"];

/** Reads the current level and slug from a /map... pathname. */
function levelAndSlugFromPathname(pathname: string): { level: FieldMapLevel; slug: string | null } {
  const parts = pathname.split("/").filter(Boolean); // ["map", level, slug] or ["map"]
  const level = parts[1];
  const slug = parts[2];
  if (level && (LEVELS as string[]).includes(level) && slug) {
    return { level: level as FieldMapLevel, slug: decodeURIComponent(slug) };
  }
  return { level: "overview", slug: null };
}

/**
 * Mounts the ported hex map script (packages/fieldmap) once per page load,
 * following the six steps in packages/fieldmap/README.md and the contract
 * in docs/design/07-integration-and-checks.md.
 *
 * Rendered once in app/map/layout.tsx, not in the per-level page
 * components, so navigating between /map and /map/[level]/[slug] doesn't
 * unmount and remount it: the script, the fetched data and the built
 * model (118 nodes) are loaded once per page load, and level/slug changes
 * are read reactively from the URL instead of the component's own props
 * (a review finding: rendering this per-page caused a full re-fetch and
 * re-setData on every level change).
 *
 * The site owns routing (`hash: false`) and its own panel (`panel: false`,
 * task 3), so this component only wires FieldMap.open <-> the URL. It does
 * not fetch data itself beyond /data/map.json, render the panel, or render
 * the server-rendered index of every problem (`index-cols` is left
 * unmounted, per the README).
 */
export function FieldMapMount() {
  const router = useRouter();
  const pathname = usePathname();
  const { level, slug } = levelAndSlugFromPathname(pathname);
  // Tracks the level/slug this component last asked FieldMap.open() to go
  // to, so the fieldmap:navigate handler doesn't re-navigate to a route
  // the site itself just navigated to (the map's own navigate() already
  // re-enters when the URL changes back in).
  const lastOpened = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      window.FIELD_MAP_OPTIONS = { hash: false, panel: false, reserveRight: 430 };

      if (!window.FieldMap) {
        await loadScriptOnce();
      }
      if (cancelled) return;

      let data: FieldMapData;
      try {
        const res = await fetch("/data/map.json");
        if (!res.ok) throw new Error(`/data/map.json responded ${res.status}`);
        data = (await res.json()) as FieldMapData;
      } catch (err) {
        if (cancelled) return;
        console.error("Field map: could not load /data/map.json", err);
        const wrap = document.getElementById("map-wrap");
        if (wrap) {
          const p = document.createElement("p");
          p.className = "fm-map-porting";
          p.textContent =
            "The map could not be loaded. Reload the page, or try again in a moment.";
          wrap.appendChild(p);
        }
        return;
      }
      if (cancelled) return;

      window.FieldMap?.setData(data);
      const initial = levelAndSlugFromPathname(window.location.pathname);
      lastOpened.current = `${initial.level}:${initial.slug ?? ""}`;
      window.FieldMap?.open(initial.level, initial.slug);

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
        if (cancelled) return;
      }
      window.FieldMap?.relayout();
    }

    function onNavigate(e: Event) {
      const { level: newLevel, slug: newSlug } = (e as FieldMapNavigateEvent).detail;
      const key = `${newLevel}:${newSlug ?? ""}`;
      const previous = lastOpened.current;
      if (key === previous) return;
      lastOpened.current = key;
      const path =
        newLevel === "overview" ? "/map" : `/map/${newLevel}/${encodeURIComponent(newSlug ?? "")}`;
      // Owner's decision: a level change is a real step through the map
      // (push, so Back walks up one level at a time: overview -> layer ->
      // area -> node, each its own history entry); a slug change at the
      // same level (e.g. problem to problem, or organisation to
      // organisation) replaces in place, matching docs/design/07 check 8's
      // "back and forward work" trace.
      const previousLevel = previous.split(":")[0];
      if (newLevel !== previousLevel) router.push(path);
      else router.replace(path);
    }

    document.addEventListener("fieldmap:navigate", onNavigate);
    boot();

    return () => {
      cancelled = true;
      document.removeEventListener("fieldmap:navigate", onNavigate);
    };
    // Runs once per page load only (see the mounting note above); level
    // and slug changes are handled by the effect below, which reads them
    // fresh from the URL on every render instead of being a dependency
    // here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route changes coming back in (browser back/forward, or the site's own
  // links) call FieldMap.open so the map, camera and lit set stay in step.
  useEffect(() => {
    const key = `${level}:${slug ?? ""}`;
    if (key === lastOpened.current) return;
    lastOpened.current = key;
    window.FieldMap?.open(level, slug);
  }, [level, slug]);

  return null;
}

let scriptPromise: Promise<void> | null = null;

function loadScriptOnce(): Promise<void> {
  if (window.FieldMap) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("fieldmap script failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = false;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("fieldmap script failed to load")));
    document.body.appendChild(script);
  });
  return scriptPromise;
}
