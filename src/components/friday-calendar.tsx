"use client";

import { useEffect, useState } from "react";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

// Month grid with every Friday (Jumu'ah) highlighted. Uses the visitor's current date.
export function FridayCalendar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  if (!now) return <div className="h-80 w-full max-w-xs rounded-2xl bg-white/60" />;

  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const fridays = cells.filter(
    (d): d is number => d !== null && new Date(year, month, d).getDay() === 5,
  );

  return (
    <div className="w-full max-w-xs rounded-2xl bg-white/70 p-5 text-left backdrop-blur-sm">
      <p className="font-bold">
        {now.toLocaleString("en-AU", { month: "long", year: "numeric" })}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-sm">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-1 text-xs text-muted">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const isFriday = i % 7 === 5;
          return (
            <span
              key={d}
              className={`mx-auto grid size-8 place-items-center rounded-full ${
                isFriday
                  ? "bg-brand-gradient font-bold text-brand-dark"
                  : "text-brand-dark/60"
              } ${d === today ? "ring-2 ring-brand-dark ring-offset-1" : ""}`}
            >
              {d}
            </span>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">
        Jumu&apos;ah this month: {fridays.join(", ")}
      </p>
    </div>
  );
}
