"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CloudSun,
  Moon,
  MoonStar,
  Sun,
  Sunrise,
  Sunset,
  type LucideIcon,
} from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MONTHS,
  PRAYERS,
  table,
  toMinutes,
  type PrayerKey,
} from "@/lib/prayer-data";

// Each prayer gets its own colour and icon, like the lanes in a calendar.
const STYLE: Record<PrayerKey, { color: string; Icon: LucideIcon }> = {
  fajr: { color: "#3f6fd9", Icon: MoonStar },
  sunrise: { color: "#ef8a17", Icon: Sunrise },
  zuhr: { color: "#0e9fb3", Icon: Sun },
  asr: { color: "#8447a8", Icon: CloudSun },
  maghrib: { color: "#d9534f", Icon: Sunset },
  isha: { color: "#24408f", Icon: Moon },
};

const START = 3; // first hour shown (earliest Fajr of the year is 3:04 am)
const END = 23;
const PX = 72; // pixels per hour
const BLOCK = 68; // height of a prayer block

const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const hourLabel = (h: number) => `${h % 12 || 12} ${h >= 12 ? "PM" : "AM"}`;

// Today's prayer times plus a week/day calendar of when each prayer starts.
export function PrayerTimetable() {
  const [now, setNow] = useState<Date | null>(null);
  const [anchor, setAnchor] = useState<Date>(new Date(2000, 0, 1));
  const [view, setView] = useState<"week" | "day">("week");
  const [shown, setShown] = useState<Set<PrayerKey>>(
    new Set(PRAYERS.map((p) => p.key)),
  );
  const [picking, setPicking] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = new Date();
    setNow(d);
    setAnchor(d);
    // A seven-column week is too tight on a phone, so start on the day view there.
    if (window.matchMedia("(max-width: 767px)").matches) setView("day");
  }, []);

  // Open scrolled to around Fajr instead of the middle of the night.
  const ready = now !== null;
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = PX * 0.5;
  }, [ready]);

  if (!now) return <div className="h-96 rounded-2xl bg-card" />;

  const todayRow = table[now.getMonth() + 1]?.find(
    (r) => r.d === now.getDate(),
  );
  const first = view === "week" ? mondayOf(anchor) : anchor;
  const dates = Array.from({ length: view === "week" ? 7 : 1 }, (_, i) =>
    addDays(first, i),
  );
  const last = dates[dates.length - 1];
  const step = view === "week" ? 7 : 1;
  const range =
    view === "day"
      ? first.toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : `${first.getDate()} ${first.toLocaleDateString("en-AU", { month: "short" })} to ${last.getDate()} ${last.toLocaleDateString("en-AU", { month: "short", year: "numeric" })}`;

  function toggle(key: PrayerKey) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else next.add(key);
      return next;
    });
  }

  const hours = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60 - START) * PX;
  const btn =
    "grid size-9 place-items-center rounded-lg border border-border bg-white hover:bg-background";
  const seg = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold ${active ? "bg-[#16c05a] text-white" : "bg-white hover:bg-background"}`;

  return (
    <div className="space-y-10">
      {todayRow && (
        <section className="rounded-2xl bg-card p-6">
          <p className="text-sm text-muted">
            Today,{" "}
            {now.toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PRAYERS.map(({ key, label }) => (
              <div key={key} className="rounded-xl bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted">
                  {label}
                </p>
                <p className="mt-1 text-xl font-bold">{todayRow[key]}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setPicking((v) => !v)}
              aria-expanded={picking}
              aria-haspopup="dialog"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-background"
            >
              <CalendarDays className="size-4" aria-hidden />
              {range}
            </button>
            {picking && (
              <DatePicker
                value={anchor}
                today={now}
                onPick={setAnchor}
                onClose={() => setPicking(false)}
              />
            )}
          </div>
          <button
            onClick={() => setAnchor(addDays(anchor, -step))}
            aria-label={view === "week" ? "Previous week" : "Previous day"}
            className={btn}
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button
            onClick={() => setAnchor(addDays(anchor, step))}
            aria-label={view === "week" ? "Next week" : "Next day"}
            className={btn}
          >
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-background"
          >
            Today
          </button>
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => setView("day")}
              aria-pressed={view === "day"}
              className={seg(view === "day")}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              aria-pressed={view === "week"}
              className={seg(view === "week")}
            >
              Week
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {PRAYERS.map(({ key, label }) => {
            const { color, Icon } = STYLE[key];
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                aria-pressed={shown.has(key)}
                className={`inline-flex items-center gap-2 text-sm font-medium ${shown.has(key) ? "" : "opacity-40"}`}
              >
                <Icon className="size-5" style={{ color }} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <div
          ref={scroller}
          data-lenis-prevent
          className="mt-4 max-h-[40rem] overflow-auto rounded-2xl border border-border bg-white"
        >
          <div className={view === "week" ? "min-w-[46rem]" : ""}>
            <div
              className="sticky top-0 z-20 grid border-b border-border bg-white"
              style={{
                gridTemplateColumns: `3.5rem repeat(${dates.length}, minmax(0, 1fr))`,
              }}
            >
              <div />
              {dates.map((d) => (
                <div
                  key={d.toISOString()}
                  className={`border-l border-border px-3 py-3 text-sm font-semibold ${sameDay(d, now) ? "bg-[#c9f26b]/40" : ""}`}
                >
                  {d.toLocaleDateString("en-AU", { weekday: "long" })}{" "}
                  {d.getDate()}
                  <span className="ml-1 font-normal text-muted">
                    {MONTHS[d.getMonth()].slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `3.5rem repeat(${dates.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="relative" style={{ height: (END - START) * PX }}>
                {hours.map((h) => (
                  <span
                    key={h}
                    className="absolute right-2 -translate-y-1/2 text-xs text-muted"
                    style={{ top: (h - START) * PX }}
                  >
                    {hourLabel(h)}
                  </span>
                ))}
              </div>
              {dates.map((d) => {
                const row = table[d.getMonth() + 1]?.find(
                  (r) => r.d === d.getDate(),
                );
                const isToday = sameDay(d, now);
                return (
                  <div
                    key={d.toISOString()}
                    className="relative border-l border-border"
                    style={{
                      height: (END - START) * PX,
                      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${PX - 1}px, var(--color-border) ${PX - 1}px, var(--color-border) ${PX}px)`,
                    }}
                  >
                    {row &&
                      PRAYERS.filter((p) => shown.has(p.key)).map(
                        ({ key, label }) => {
                          const { color, Icon } = STYLE[key];
                          const top = (toMinutes(row[key]) / 60 - START) * PX;
                          return (
                            <div
                              key={key}
                              className="absolute inset-x-1 overflow-hidden rounded-lg px-2.5 py-2 text-white"
                              style={{
                                top,
                                height: BLOCK,
                                background: `linear-gradient(135deg, color-mix(in srgb, ${color}, white 12%), ${color})`,
                              }}
                            >
                              <div className="flex items-center gap-1.5 text-sm font-bold">
                                <Icon className="size-4" aria-hidden />
                                {label}
                              </div>
                              <div className="mt-0.5 text-xl font-extrabold leading-tight">
                                {row[key]}
                              </div>
                            </div>
                          );
                        },
                      )}
                    {isToday && nowTop >= 0 && (
                      <div
                        className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-red-500"
                        style={{ top: nowTop }}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Each block sits at the time that prayer starts in Warrnambool. The red
          line is the time now.
        </p>
      </section>
    </div>
  );
}
