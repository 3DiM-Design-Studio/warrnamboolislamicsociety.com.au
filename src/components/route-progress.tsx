"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// A thin green bar across the top of the screen, like YouTube's: it runs while a page is loading, on a reload
// and every time you move to another page, then fills up and fades out.
//
// The bar itself is plain HTML in the root layout (see RouteProgressBar), so it is already on screen during a
// reload, before any script has run. This file only starts and finishes it. The look is in globals.css (.wis-progress).

/** The bar's markup. It is drawn by the server so it can be seen from the very first frame. */
export function RouteProgressBar() {
  return (
    <div id="wis-progress" aria-hidden className="wis-progress">
      <div className="wis-progress-bar" />
    </div>
  );
}

const MAX_MS = 15000; // never leave the bar running if a page never arrives
const MIN_MS = 600; // even a very fast page shows a short, smooth sweep instead of a flash

export function RouteProgress() {
  const path = usePathname();
  const search = useSearchParams().toString();
  const here = `${path}?${search}`;
  const current = useRef(here);
  const timers = useRef<number[]>([]);
  const startedAt = useRef(0); // 0 = the page load itself (performance.now() counts from there)

  function el() {
    return document.getElementById("wis-progress");
  }
  function clear() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }
  function start() {
    const bar = el();
    if (!bar) return;
    clear();
    bar.classList.remove("is-done");
    void bar.offsetWidth; // restart the animation from the left
    bar.classList.add("is-running");
    startedAt.current = performance.now();
    timers.current.push(window.setTimeout(finish, MAX_MS));
  }
  function finish() {
    const wait = MIN_MS - (performance.now() - startedAt.current);
    if (wait > 0) {
      // Too soon: let the bar travel a little first so it never just blinks.
      clear();
      timers.current.push(window.setTimeout(finish, wait));
      return;
    }
    const bar = el();
    document.documentElement.removeAttribute("data-loading");
    if (!bar) return;
    clear();
    bar.classList.remove("is-running");
    bar.classList.add("is-done");
    timers.current.push(window.setTimeout(() => bar.classList.remove("is-done"), 1300));
  }

  // The address changed, so the new page has arrived. But its grey placeholders may still be showing while the
  // content streams in, so the bar waits until they are gone. The first run covers a reload.
  useEffect(() => {
    current.current = here;
    const waiting = () => !!document.querySelector('[role="status"][aria-busy="true"]');
    if (!waiting()) {
      finish();
      return;
    }
    const watcher = new MutationObserver(() => {
      if (waiting()) return;
      watcher.disconnect();
      finish();
    });
    watcher.observe(document.body, { childList: true, subtree: true });
    const cap = window.setTimeout(finish, MAX_MS);
    return () => {
      watcher.disconnect();
      window.clearTimeout(cap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here]);

  // A click on a link to another page, or the browser's Back / Forward, is the start of a load.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    }
    function onPop() {
      if (`${window.location.pathname}?${window.location.search.replace(/^\?/, "")}` !== current.current) start();
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
