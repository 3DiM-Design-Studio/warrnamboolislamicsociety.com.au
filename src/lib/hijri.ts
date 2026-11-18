// The Islamic (Hijri) date, worked out with the browser's own Umm al-Qura calendar (no list to keep up to date).
// Umm al-Qura is a calculated calendar, so it can differ by a day from the local moon sighting.

const fmt = new Intl.DateTimeFormat("en-AU-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" });

/** For example "8 Jumada II 1448 AH". Pass a date; after Maghrib the Hijri day really starts, but we show the calendar day. */
export function hijriDate(date: Date = new Date()): string {
  try {
    return fmt.format(date);
  } catch {
    return "";
  }
}
