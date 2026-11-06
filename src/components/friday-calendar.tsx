"use client";

import { useEffect, useState } from "react";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

// Month grid with every Friday (Jumu'ah) highlighted. Uses the visitor's current date.
export function FridayCalendar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  if (!now)
    return <div className="h-96 w-full max-w-sm rounded-2xl bg-white/60" />;

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
    // Perspective on the outside, tilt on the inside, so the card reads as a plane in 3D that
    // runs off the section's left and bottom edges, where the section clips it.
    <div className="w-full max-w-sm -translate-y-2 -mb-12 [perspective:1100px] md:-translate-x-14">
      <div className="rounded-2xl bg-white/90 p-6 shadow-[0_14px_30px_-12px_rgba(0,191,46,0.35)] text-left backdrop-blur-sm transition-transform duration-500 [transform:rotateY(14deg)_rotateX(7deg)_rotateZ(-1deg)] hover:[transform:rotateY(5deg)_rotateX(2deg)]">
        <p className="text-xl font-bold">
          {now.toLocaleString("en-AU", { month: "long", year: "numeric" })}
        </p>
        <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center text-[0.95rem]">
          {weekdays.map((w, i) => (
            <span key={i} className="pb-1 text-sm text-muted">
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <span key={`e${i}`} />;
            const isFriday = i % 7 === 5;
            return (
              <span
                key={d}
                className={`mx-auto grid size-10 place-items-center rounded-full ${
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
        <p className="mt-5 text-sm text-muted">
          Jumu&apos;ah this month: {fridays.join(", ")}
        </p>
      </div>
    </div>
  );
}
