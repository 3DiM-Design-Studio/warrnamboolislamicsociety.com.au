"use client";

import { ArrowRight, CalendarDays, Moon } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { PRAYERS, addDays, fmtTime, melbourneMinutes, melbourneToday } from "@/lib/prayer";
import type { TodayIqamah } from "@/lib/content";
import { timetableAzan } from "@/lib/timetable";

export type NextEvent = { id: string; title: string; when: string; time: string; place: string; ongoing: boolean };

// The minute right now, so the "in 2h 5m" text keeps itself up to date. The server cannot know it, so it sends "null".
const subscribe = (cb: () => void) => {
  const t = window.setInterval(cb, 20000);
  return () => window.clearInterval(t);
};
const minuteNow = () => Math.floor(Date.now() / 60000);

const inText = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${Math.max(m, 1)} min`);

// Maps the timetable's prayer names to the Iqamah list's names.
const IQAMAH_KEY = { fajr: "fajr", dhuhr: "zuhr", asr: "asr", maghrib: "maghrib", isha: "isha" } as const;

function nextPrayer(iqamah: TodayIqamah | null) {
  const today = melbourneToday();
  const now = melbourneMinutes();
  const az = timetableAzan(today);
  if (az) {
    for (const [key, name] of PRAYERS) {
      if (az[key] > now) return { name, azan: az[key], mins: az[key] - now, tomorrow: false, iqamah: iqamah?.times[IQAMAH_KEY[key]] ?? null };
    }
  }
  const tomorrow = timetableAzan(addDays(today, 1));
  if (!tomorrow) return null;
  return { name: PRAYERS[0][1], azan: tomorrow.fajr, mins: tomorrow.fajr + 1440 - now, tomorrow: true, iqamah: null as string | null };
}

const card = "group flex min-w-0 items-center gap-4 rounded-2xl bg-card p-5 transition-colors hover:bg-white sm:p-6";
const badge = "grid size-12 shrink-0 place-items-center rounded-full bg-brand-gradient text-brand-dark";

// Two cards near the top of the home page: the next prayer (worked out in the browser, so it is always right) and the next event.
export function NextUp({ iqamah, event }: { iqamah: TodayIqamah | null; event: NextEvent | null }) {
  const tick = useSyncExternalStore(subscribe, minuteNow, () => null);
  const next = tick === null ? null : nextPrayer(iqamah);

  return (
    <section aria-label="What is next" className="grid gap-4 sm:grid-cols-2">
      <Link href="/prayer-times" className={card}>
        <span className={badge}>
          <Moon className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted">Next prayer</span>
          {next ? (
            <>
              <span className="mt-0.5 block text-2xl font-bold tracking-tight tabular-nums">
                {next.name} {fmtTime(next.azan)}
              </span>
              <span className="block text-sm text-muted">
                In {inText(next.mins)}
                {next.tomorrow ? " (tomorrow)" : ""}
                {next.iqamah ? ` · Iqamah ${next.iqamah}` : ""}
              </span>
            </>
          ) : (
            <span className="mt-1 block space-y-2" aria-hidden>
              <span className="skeleton block h-7 w-40" />
              <span className="skeleton block h-4 w-48 max-w-full" />
            </span>
          )}
        </span>
        <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>

      <Link href={event ? `/events/${event.id}` : "/events"} className={card}>
        <span className={badge}>
          <CalendarDays className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-muted">{event?.ongoing ? "On now" : "Next event"}</span>
          {event ? (
            <>
              <span className="mt-0.5 line-clamp-2 block text-xl font-bold leading-snug tracking-tight sm:text-2xl">{event.title}</span>
              <span className="line-clamp-2 block text-sm text-muted">
                {event.when} · {event.time}
                {event.place ? ` · ${event.place}` : ""}
              </span>
            </>
          ) : (
            <>
              <span className="mt-0.5 block text-2xl font-bold tracking-tight">Nothing planned yet</span>
              <span className="block text-sm text-muted">See the events page for updates</span>
            </>
          )}
        </span>
        <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </section>
  );
}
