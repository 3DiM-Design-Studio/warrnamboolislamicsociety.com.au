"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOutIdle } from "@/lib/actions/auth";
import { IDLE_MS, IDLE_WARN_MS } from "@/lib/session-rules";
import { Button } from "@/components/admin/ui";

const ACTIVITY = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * Signs the admin out when nobody has touched the page for 8 hours, so a forgotten login on a shared
 * computer does not stay open. Five minutes before, it asks "Stay signed in?".
 */
export function IdleGuard() {
  const router = useRouter();
  const last = useRef(0);
  const pinged = useRef(0);
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    last.current = Date.now();
    pinged.current = Date.now();
    const touch = () => {
      last.current = Date.now();
      setMinutes((m) => (m === null ? m : null));
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    const tick = setInterval(() => {
      const now = Date.now();
      const idle = now - last.current;
      if (idle >= IDLE_MS) {
        void signOutIdle();
        return;
      }
      setMinutes(idle >= IDLE_MS - IDLE_WARN_MS ? Math.max(1, Math.ceil((IDLE_MS - idle) / 60_000)) : null);
      // While someone is busy on one page, let the server know now and then so it keeps counting from their last activity.
      if (idle < 5 * 60_000 && now - pinged.current > 30 * 60_000) {
        pinged.current = now;
        router.refresh();
      }
    }, 30_000);

    return () => {
      ACTIVITY.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(tick);
    };
  }, [router]);

  if (minutes === null) return null;
  return (
    <div role="alertdialog" aria-label="Still there?" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-dark p-4 text-white shadow-xl">
      <span className="text-sm">
        You will be signed out in about <b>{minutes} {minutes === 1 ? "minute" : "minutes"}</b> because the page has been quiet.
      </span>
      <Button
        variant="primary"
        onClick={() => {
          last.current = Date.now();
          pinged.current = Date.now();
          setMinutes(null);
          router.refresh();
        }}
      >
        Stay signed in
      </Button>
    </div>
  );
}
