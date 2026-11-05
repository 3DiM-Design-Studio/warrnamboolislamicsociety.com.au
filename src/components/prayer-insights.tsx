"use client";

import { useEffect, useState } from "react";
import { YearChart } from "@/components/year-chart";
import {
  MONTHS,
  PRAYERS,
  days,
  dayLabel,
  formatDuration,
  formatTime,
  type PrayerKey,
} from "@/lib/prayer-data";

function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

// Accessible table alternative to a chart: start and end of each month.
function MonthSummary({
  values,
  format,
}: {
  values: number[];
  format: (v: number) => string;
}) {
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-medium">View as table</summary>
      <table className="mt-3 w-full text-left">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-muted">
            <th className="py-2 font-medium">Month</th>
            <th className="py-2 font-medium">Start of month</th>
            <th className="py-2 font-medium">End of month</th>
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((m, i) => {
            const idxs = days
              .filter((d) => d.month === i + 1)
              .map((d) => d.idx);
            return (
              <tr key={m} className="border-t border-border">
                <td className="py-2">{m}</td>
                <td className="py-2">{format(values[idxs[0]])}</td>
                <td className="py-2">
                  {format(values[idxs[idxs.length - 1]])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </details>
  );
}

const signed = (min: number) => {
  const m = Math.round(Math.abs(min));
  if (m === 0) return "no change";
  const h = Math.floor(m / 60);
  const text = h ? `${h}h ${m % 60}m` : `${m} min`;
  return `${text} ${min > 0 ? "later" : "earlier"}`;
};

// Trends across the year for a chosen prayer, plus daylight length.
export function PrayerInsights() {
  const [prayer, setPrayer] = useState<PrayerKey>("fajr");
  const [todayIdx, setTodayIdx] = useState(-1);

  useEffect(() => {
    const now = new Date();
    setTodayIdx(
      days.findIndex(
        (d) => d.month === now.getMonth() + 1 && d.d === now.getDate(),
      ),
    );
  }, []);

  const label = PRAYERS.find((p) => p.key === prayer)!.label;
  const values = days.map((d) => d.mins[prayer]);
  const daylight = days.map((d) => d.daylight);

  const extremes = (v: number[]) => {
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    return { lo, hi, iLo: v.indexOf(lo), iHi: v.indexOf(hi) };
  };
  const t = extremes(values);
  const dl = extremes(daylight);
  const ahead =
    todayIdx >= 0
      ? values[(todayIdx + 30) % values.length] - values[todayIdx]
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Trends through the year</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a prayer to see how its start time moves across the seasons.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Prayer">
        {PRAYERS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPrayer(p.key)}
            aria-pressed={prayer === p.key}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              prayer === p.key
                ? "bg-brand-gradient text-brand-dark"
                : "bg-card hover:bg-white/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-6">
        <h3 className="font-bold">{label} start time across the year</h3>
        <p className="text-xs text-muted">
          Hover or touch the chart to read the time for any day.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile
            label="Today"
            value={todayIdx >= 0 ? formatTime(values[todayIdx]) : "-"}
            note={todayIdx >= 0 ? dayLabel(days[todayIdx]) : undefined}
          />
          <Tile
            label="Earliest"
            value={formatTime(t.lo)}
            note={dayLabel(days[t.iLo])}
          />
          <Tile
            label="Latest"
            value={formatTime(t.hi)}
            note={dayLabel(days[t.iHi])}
          />
          <Tile
            label="In 30 days"
            value={todayIdx >= 0 ? signed(ahead) : "-"}
            note="compared with today"
          />
        </div>
        <div className="mt-6">
          <YearChart
            values={values}
            todayIdx={todayIdx}
            formatValue={formatTime}
            label={`${label} start time across the year`}
          />
        </div>
        <MonthSummary values={values} format={formatTime} />
      </div>

      <div className="rounded-2xl bg-card p-6">
        <h3 className="font-bold">Daylight length (sunrise to Maghrib)</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Tile
            label="Today"
            value={todayIdx >= 0 ? formatDuration(daylight[todayIdx]) : "-"}
          />
          <Tile
            label="Longest day"
            value={formatDuration(dl.hi)}
            note={dayLabel(days[dl.iHi])}
          />
          <Tile
            label="Shortest day"
            value={formatDuration(dl.lo)}
            note={dayLabel(days[dl.iLo])}
          />
        </div>
        <div className="mt-6">
          <YearChart
            values={daylight}
            todayIdx={todayIdx}
            formatValue={(v) => formatDuration(v)}
            label="Daylight length across the year"
          />
        </div>
        <MonthSummary values={daylight} format={formatDuration} />
      </div>
    </section>
  );
}
