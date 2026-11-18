"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "wis_analytics";
const CHANGED = "wis-analytics-changed";

function read(): "yes" | "no" | "unset" {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : "unset";
  } catch {
    return "no"; // private window or blocked storage: count nothing and do not nag
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
  };
}

function write(v: "yes" | "no" | "unset") {
  try {
    if (v === "unset") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, v);
  } catch {}
  window.dispatchEvent(new Event(CHANGED));
}

const onAdmin = () => window.location.pathname.startsWith("/admin");

// Visit counting (Google Analytics) starts only after the visitor says yes, and never runs in the admin panel.
export function AnalyticsConsent({ gaId }: { gaId?: string }) {
  const choice = useSyncExternalStore(subscribe, read, () => "no" as const);
  const admin = useSyncExternalStore(() => () => {}, onAdmin, () => true);
  if (!gaId || admin) return null;
  return (
    <>
      {choice === "yes" && <GoogleAnalytics gaId={gaId} />}
      {choice === "unset" && (
        <div role="region" aria-label="Visit counting" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl bg-brand-dark p-4 text-white shadow-2xl sm:bottom-5 sm:p-5">
          <p className="text-sm leading-relaxed text-white/85">
            May we count visits to this website with Google Analytics? It helps us see which pages people use. We do not show ads or sell anything.{" "}
            <Link href="/privacy-policy" className="underline">Read our privacy policy</Link>.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => write("yes")} className="btn-primary">Yes, that is fine</button>
            <button
              type="button"
              onClick={() => write("no")}
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// A button for the privacy page so visitors can change their mind at any time.
export function AnalyticsChoiceButton() {
  const choice = useSyncExternalStore(subscribe, read, () => "unset" as const);
  return (
    <p className="text-sm">
      Your choice now: <strong>{choice === "yes" ? "Visits are counted" : choice === "no" ? "Visits are not counted" : "Not chosen yet"}</strong>.{" "}
      <button type="button" onClick={() => write(choice === "yes" ? "no" : "yes")} className="text-brand underline">
        {choice === "yes" ? "Stop counting my visits" : "Count my visits"}
      </button>
    </p>
  );
}
