"use client";

import { useRef, useState } from "react";
import { MONTHS, days, dayLabel } from "@/lib/prayer-data";

const W = 720;
const H = 280;
const M = { l: 64, r: 20, t: 24, b: 30 };

// Single-series line + area chart across the year, with crosshair tooltip,
// labelled extremes and a "today" marker.
export function YearChart({
  values,
  todayIdx,
  formatValue,
  label,
}: {
  values: number[];
  todayIdx: number;
  formatValue: (v: number) => string;
  label: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = values.length;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = hi - lo > 360 ? 120 : 60;
  const yMin = Math.floor((lo - 10) / step) * step;
  const yMax = Math.ceil((hi + 10) / step) * step;
  const x = (i: number) => M.l + (i / (n - 1)) * (W - M.l - M.r);
  const y = (v: number) =>
    M.t + (1 - (v - yMin) / (yMax - yMin)) * (H - M.t - M.b);

  const line = values
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join("");
  const area = `${line}L${x(n - 1)},${y(yMin)}L${x(0)},${y(yMin)}Z`;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) ticks.push(t);
  const monthStarts = MONTHS.map((_, m) =>
    days.findIndex((d) => d.month === m + 1),
  );

  const iMin = values.indexOf(lo);
  const iMax = values.indexOf(hi);
  const active = hover ?? null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = ref.current!.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vx - M.l) / (W - M.l - M.r)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  const anchor = (i: number) =>
    x(i) < 110 ? "start" : x(i) > W - 110 ? "end" : "middle";

  return (
    <div
      className="relative"
      style={
        {
          "--series": "#0f8a63",
          "--grid": "#e3e4dd",
          "--ink": "#121512",
          "--ink2": "#5f655e",
          "--surface": "#ffffff",
        } as React.CSSProperties
      }
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-pan-y"
        role="img"
        aria-label={`${label}. Lowest ${formatValue(lo)} on ${dayLabel(days[iMin])}, highest ${formatValue(hi)} on ${dayLabel(days[iMax])}.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.l}
              x2={W - M.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--grid)"
              strokeWidth={1}
            />
            <text
              x={M.l - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--ink2)"
            >
              {formatValue(t)}
            </text>
          </g>
        ))}
        {monthStarts.map((s, m) => (
          <text key={m} x={x(s)} y={H - 8} fontSize={11} fill="var(--ink2)">
            {MONTHS[m].slice(0, 3)}
          </text>
        ))}

        <path d={area} fill="var(--series)" opacity={0.1} />
        <path
          d={line}
          fill="none"
          stroke="var(--series)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {[iMax, iMin].map((i, k) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(values[i])}
              r={4}
              fill="var(--series)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <text
              x={x(i)}
              y={y(values[i]) + (k === 0 ? -10 : 18)}
              textAnchor={anchor(i)}
              fontSize={11}
              fill="var(--ink2)"
            >
              {formatValue(values[i])}
            </text>
          </g>
        ))}

        {todayIdx >= 0 && (
          <g>
            <line
              x1={x(todayIdx)}
              x2={x(todayIdx)}
              y1={M.t}
              y2={H - M.b}
              stroke="var(--ink)"
              strokeWidth={1}
              strokeDasharray="0"
              opacity={0.35}
            />
            <circle
              cx={x(todayIdx)}
              cy={y(values[todayIdx])}
              r={5}
              fill="var(--ink)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
            <text
              x={x(todayIdx)}
              y={M.t - 8}
              textAnchor={anchor(todayIdx)}
              fontSize={11}
              fontWeight={600}
              fill="var(--ink)"
            >
              Today
            </text>
          </g>
        )}

        {active !== null && (
          <g pointerEvents="none">
            <line
              x1={x(active)}
              x2={x(active)}
              y1={M.t}
              y2={H - M.b}
              stroke="var(--ink2)"
              strokeWidth={1}
            />
            <circle
              cx={x(active)}
              cy={y(values[active])}
              r={5}
              fill="var(--series)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {active !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-black/10"
          style={{
            left: `${(x(active) / W) * 100}%`,
            transform: `translateX(${x(active) > W * 0.6 ? "calc(-100% - 12px)" : "12px"})`,
          }}
        >
          <p className="text-[#5f655e]">{dayLabel(days[active])}</p>
          <p className="font-bold">{formatValue(values[active])}</p>
        </div>
      )}
    </div>
  );
}
