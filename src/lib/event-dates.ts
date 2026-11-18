import type { EventRow } from "@/lib/types";

// Small, plain helpers for event dates (all days are YYYY-MM-DD, as saved in the database).

type Dated = Pick<EventRow, "event_date" | "event_time" | "end_date" | "end_time">;

const day = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", ...opts }).format(new Date(`${iso}T12:00:00Z`));

/** The last day an event takes up (its end day, or its start day when it has none). */
export const eventLastDay = (e: Pick<Dated, "event_date" | "end_date">) => e.end_date && e.end_date > e.event_date ? e.end_date : e.event_date;

export type EventPhase = "upcoming" | "ongoing" | "past";

/** Where an event is today: still to come, on right now (a multi-day event that has started), or finished. */
export function eventPhase(e: Pick<Dated, "event_date" | "end_date">, today: string): EventPhase {
  if (eventLastDay(e) < today) return "past";
  if (e.event_date <= today) return "ongoing";
  return "upcoming";
}

/** "Mon, 16 Nov 2026", or "16 Nov to 20 Nov 2026" for an event that runs over several days. */
export function eventDateText(e: Pick<Dated, "event_date" | "end_date">, long = false): string {
  const first = long ? day(e.event_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : day(e.event_date, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const last = eventLastDay(e);
  if (last === e.event_date) return first;
  const end = long ? day(last, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : day(last, { day: "numeric", month: "short", year: "numeric" });
  const start = long ? first : day(e.event_date, { weekday: "short", day: "numeric", month: "short" });
  return `${start} to ${end}`;
}

/** How far Melbourne is ahead of UTC at a moment in time, in minutes (changes with daylight saving). */
function melbourneOffset(utcMs: number): number {
  const parts: Record<string, number> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: "Australia/Melbourne", hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
    .formatToParts(new Date(utcMs))
    .forEach((p) => {
      if (p.type !== "literal") parts[p.type] = Number(p.value);
    });
  const local = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return Math.round((local - Math.floor(utcMs / 60000) * 60000) / 60000);
}

/** The exact moment a Melbourne date and time (HH:MM) happens. */
export function melbourneToUtc(date: string, time: string): Date {
  const guess = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), +time.slice(0, 2), +time.slice(3, 5));
  const first = guess - melbourneOffset(guess) * 60000;
  return new Date(guess - melbourneOffset(first) * 60000);
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Start and end of an event as UTC moments. With no end time it is taken as lasting two hours. */
export function eventSpan(e: Dated): { start: Date; end: Date } {
  const start = melbourneToUtc(e.event_date, e.event_time);
  const endDay = eventLastDay(e);
  const end = e.end_time || endDay !== e.event_date ? melbourneToUtc(endDay, (e.end_time || e.event_time).slice(0, 5)) : new Date(start.getTime() + 2 * 3600 * 1000);
  return { start, end: end > start ? end : new Date(start.getTime() + 2 * 3600 * 1000) };
}

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** A calendar file (.ics) for one event, which Apple, Google and Outlook calendars all open. */
export function eventCalendarFile(e: Dated & Pick<EventRow, "id" | "title" | "place" | "short_description" | "description">, pageUrl: string): string {
  const { start, end } = eventSpan(e);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Warrnambool Islamic Society//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@warrnamboolislamicsociety`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText(e.title)}`,
    `LOCATION:${icsText(e.place)}`,
    `DESCRIPTION:${icsText(`${e.short_description || e.description || ""}\n\nMore details: ${pageUrl}`.trim())}`,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** A "add to Google Calendar" link for one event. */
export function googleCalendarLink(e: Dated & Pick<EventRow, "title" | "place" | "short_description" | "description">, pageUrl: string): string {
  const { start, end } = eventSpan(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `${e.short_description || e.description || ""}\n\nMore details: ${pageUrl}`.trim(),
    location: e.place,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
