import data from "@/content/prayer-times.json";

export type PrayerKey =
  "fajr" | "sunrise" | "zuhr" | "asr" | "maghrib" | "isha";

export const PRAYERS: { key: PrayerKey; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "zuhr", label: "Zuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type Row = { d: number } & Record<PrayerKey, string>;
export const table = data as unknown as Record<string, Row[]>;

// "3:37 am" -> minutes after midnight
export function toMinutes(t: string) {
  const m = t.match(/(\d+):(\d+)\s*(am|pm)/i)!;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "pm") h += 12;
  return h * 60 + Number(m[2]);
}

// minutes after midnight -> "3:37 am"
export function formatTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
}

// 785 -> "13h 5m"
export function formatDuration(min: number) {
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
}

export type Day = {
  idx: number;
  month: number; // 1-12
  d: number;
  mins: Record<PrayerKey, number>;
  daylight: number; // sunrise to maghrib, in minutes
};

// One entry per day of the year, in calendar order.
export const days: Day[] = Object.keys(table)
  .map(Number)
  .sort((a, b) => a - b)
  .flatMap((month) => table[month].map((r) => ({ month, r })))
  .map(({ month, r }, idx) => {
    const mins = Object.fromEntries(
      PRAYERS.map(({ key }) => [key, toMinutes(r[key])]),
    ) as Record<PrayerKey, number>;
    return { idx, month, d: r.d, mins, daylight: mins.maghrib - mins.sunrise };
  });

export const dayLabel = (day: Day) =>
  `${day.d} ${MONTHS[day.month - 1].slice(0, 3)}`;
