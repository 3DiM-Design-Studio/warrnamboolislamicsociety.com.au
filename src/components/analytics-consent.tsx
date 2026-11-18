"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

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

// The cookie banner. Essential cookies are always on. Visit counting (Google Analytics) starts only after the visitor says yes,
// and never runs in the admin panel. "Reject" and "Accept" have the same weight, and the choice can be changed later from the footer.
export function AnalyticsConsent({ gaId }: { gaId?: string }) {
  const choice = useSyncExternalStore(subscribe, read, () => "no" as const);
  const admin = useSyncExternalStore(() => () => {}, onAdmin, () => true);
  const [more, setMore] = useState(false);
  const [counting, setCounting] = useState(false);
  if (admin) return null;
  const pick = (v: "yes" | "no") => {
    write(v);
    setMore(false);
  };
  const outline = "inline-flex items-center justify-center rounded-full border-2 border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white";
  return (
    <>
      {gaId && choice === "yes" && <GoogleAnalytics gaId={gaId} />}
      {choice === "unset" && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-h-[calc(100dvh-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl bg-brand-dark p-4 text-white shadow-2xl sm:bottom-5 sm:p-6"
        >
          <p id="cookie-title" className="text-lg font-bold">
            We use cookies
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/85">
            Some cookies are needed to keep the website working, such as card payments and committee sign-in. With your permission we also use Google Analytics to count visits, so we can see which pages
            people use. We do not show ads or sell your information.{" "}
            <Link href="/cookie-policy" className="underline">Cookie policy</Link> · <Link href="/privacy-policy" className="underline">Privacy policy</Link>
          </p>

          {more && (
            <div className="mt-4 space-y-3 rounded-xl bg-white/10 p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">Needed to work</p>
                  <p className="text-white/75">Payments, sign-in and remembering this choice. Always on.</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Always on</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-white/15 pt-3">
                <div>
                  <p id="cookie-count-label" className="font-semibold">Counting visits</p>
                  <p className="text-white/75">Google Analytics. Shows us which pages are used, not who you are.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={counting}
                  aria-labelledby="cookie-count-label"
                  onClick={() => setCounting(!counting)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${counting ? "bg-brand" : "bg-white/30"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white transition-transform ${counting ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {more ? (
              <button type="button" onClick={() => pick(counting ? "yes" : "no")} className="btn-primary sm:flex-1">
                Save my choice
              </button>
            ) : (
              <>
                <button type="button" onClick={() => pick("yes")} className="btn-primary sm:flex-1">
                  Accept all
                </button>
                <button type="button" onClick={() => pick("no")} className={`${outline} sm:flex-1`}>
                  Reject extra cookies
                </button>
                <button type="button" onClick={() => setMore(true)} className={`${outline} sm:flex-1`} aria-expanded={false}>
                  Settings
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Lets a visitor open the banner again from the footer.
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => write("unset")} className={className}>
      Cookie settings
    </button>
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
