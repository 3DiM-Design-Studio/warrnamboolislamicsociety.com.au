import { table, toMinutes } from "@/lib/prayer-data";
import type { AzanTimes } from "@/lib/prayer";

/** The Azan times in the society's published timetable (src/content/prayer-times.json) for a YYYY-MM-DD date. */
export function timetableAzan(date: string): AzanTimes | null {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const row = table[month]?.find((r) => r.d === day);
  if (!row) return null;
  return {
    fajr: toMinutes(row.fajr),
    sunrise: toMinutes(row.sunrise),
    dhuhr: toMinutes(row.zuhr),
    asr: toMinutes(row.asr),
    maghrib: toMinutes(row.maghrib),
    isha: toMinutes(row.isha),
  };
}
