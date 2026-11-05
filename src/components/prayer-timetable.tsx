"use client";

import { useEffect, useState } from "react";
import { MONTHS, PRAYERS, table, type PrayerKey } from "@/lib/prayer-data";

// Today's prayer times plus a filterable timetable (month or whole year, Fridays only, chosen prayers).
export function PrayerTimetable() {
  const [now, setNow] = useState<Date | null>(null);
  const [month, setMonth] = useState(1); // 0 = whole year
  const [fridaysOnly, setFridaysOnly] = useState(false);
  const [shown, setShown] = useState<Set<PrayerKey>>(
    new Set(PRAYERS.map((p) => p.key)),
  );

  useEffect(() => {
    const d = new Date();
    setNow(d);
    setMonth(d.getMonth() + 1);
  }, []);

  if (!now) return <div className="h-96 rounded-2xl bg-card" />;

  const year = now.getFullYear();
  const todayRow = table[now.getMonth() + 1]?.find(
    (r) => r.d === now.getDate(),
  );
  const monthNumbers = month === 0 ? MONTHS.map((_, i) => i + 1) : [month];
  const rows = monthNumbers
    .flatMap((m) => (table[m] ?? []).map((r) => ({ m, r })))
    .map(({ m, r }) => ({ m, r, date: new Date(year, m - 1, r.d) }))
    .filter(({ m, date }) => date.getMonth() === m - 1) // drops 29 Feb in non-leap years
    .filter(({ date }) => !fridaysOnly || date.getDay() === 5);
  const columns = PRAYERS.filter((p) => shown.has(p.key));

  function toggle(key: PrayerKey) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else next.add(key);
      return next;
    });
  }

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
        <h2 className="text-2xl font-bold">Timetable</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Month"
            className="rounded-full border border-brand-dark/20 bg-card px-4 py-2 text-sm"
          >
            <option value={0}>Whole year</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m} {year}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFridaysOnly((v) => !v)}
            aria-pressed={fridaysOnly}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              fridaysOnly ? "bg-brand-gradient text-brand-dark" : "bg-card"
            }`}
          >
            Fridays only
          </button>
          <span
            className="mx-1 hidden h-6 w-px bg-border sm:block"
            aria-hidden
          />
          {PRAYERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={shown.has(key)}
              className={`rounded-full px-3 py-2 text-sm ${
                shown.has(key)
                  ? "bg-brand-dark text-white"
                  : "bg-card text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{rows.length} days shown</p>

        <div className="mt-4 max-h-[36rem] overflow-auto rounded-2xl bg-card">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-xs uppercase tracking-widest text-muted">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Day</th>
                {columns.map(({ key, label }) => (
                  <th key={key} className="p-4 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, r, date }) => {
                const isToday =
                  m === now.getMonth() + 1 && r.d === now.getDate();
                return (
                  <tr
                    key={`${m}-${r.d}`}
                    className={`border-b border-border last:border-0 ${
                      isToday
                        ? "bg-[#c9f26b]/40 font-bold"
                        : date.getDay() === 5
                          ? "bg-background"
                          : ""
                    }`}
                  >
                    <td className="p-4">
                      {r.d} {MONTHS[m - 1].slice(0, 3)}
                    </td>
                    <td className="p-4">
                      {date.toLocaleDateString("en-AU", { weekday: "long" })}
                    </td>
                    {columns.map(({ key }) => (
                      <td key={key} className="p-4">
                        {r[key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Times are prayer start times for Warrnambool. Fridays are shaded.
        </p>
      </section>
    </div>
  );
}
