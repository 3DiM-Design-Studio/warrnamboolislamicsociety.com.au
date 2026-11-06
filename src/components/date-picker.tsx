"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MONTHS } from "@/lib/prayer-data";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Monday first, to match the week calendar.
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// A small month calendar in a popover. Picking a day calls onPick and closes it.
export function DatePicker({
  value,
  today,
  onPick,
  onClose,
}: {
  value: Date;
  today: Date;
  onPick: (d: Date) => void;
  onClose: () => void;
}) {
  const [month, setMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const y = month.getFullYear();
  const m = month.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // blanks before the 1st
  const count = new Date(y, m + 1, 0).getDate();
  const cells = Array.from({ length: lead + count }, (_, i) =>
    i < lead ? null : new Date(y, m, i - lead + 1),
  );

  const nav = "grid size-8 place-items-center rounded-lg hover:bg-background";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Choose a date"
      className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-border bg-white p-4 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(y, m - 1, 1))}
          aria-label="Previous month"
          className={nav}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p className="text-sm font-bold">
          {MONTHS[m]} {y}
        </p>
        <button
          type="button"
          onClick={() => setMonth(new Date(y, m + 1, 1))}
          aria-label="Next month"
          className={nav}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              onClick={() => {
                onPick(d);
                onClose();
              }}
              aria-label={d.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              aria-pressed={sameDay(d, value)}
              className={`mx-auto grid size-9 place-items-center rounded-full text-sm ${
                sameDay(d, value)
                  ? "bg-[#16c05a] font-bold text-white"
                  : sameDay(d, today)
                    ? "bg-[#c9f26b]/60 font-bold hover:bg-[#c9f26b]"
                    : "hover:bg-background"
              }`}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onPick(today);
          onClose();
        }}
        className="mt-3 w-full rounded-lg border border-border py-2 text-sm font-semibold hover:bg-background"
      >
        Today
      </button>
    </div>
  );
}
