export function fmtDate(date: string, long = false): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: long ? "long" : undefined,
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}
