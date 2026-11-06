import { CalendarDays, Clock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PrayerTimetable } from "@/components/prayer-timetable";
import { prayerNotes } from "@/content/site";
import { getJumuah, getTodayIqamah } from "@/lib/content";

export const metadata = { title: "Prayer Times" };

export default async function PrayerTimes() {
  const [iqamah, jumuah] = await Promise.all([getTodayIqamah(), getJumuah()]);
  // The Jumu'ah line comes from the admin (seasons), so it always matches the time on the home page.
  const notes = prayerNotes.map((n) =>
    n.includes("Jumu'ah")
      ? `Jumu'ah prayer is conducted every Friday${jumuah.today ? ` at ${jumuah.today}` : ""}.`
      : n,
  );
  return (
    <PageShell
      title="Find the right time to pray, every day of the year."
      crumb="Prayer Times"
      highlight="right time"
      icons={{
        time: <Clock className="size-[0.75em]" aria-hidden />,
        year: <CalendarDays className="size-[0.75em]" aria-hidden />,
      }}
      intro="Today's times and a week-by-week calendar for Warrnambool."
    >
      <ul className="list-disc space-y-2 pl-5">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      {jumuah.seasons.length > 1 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {jumuah.seasons.map((j) => (
            <li key={j.name}>
              {j.name} ({j.range}): {j.time}
            </li>
          ))}
        </ul>
      )}
      <PrayerTimetable iqamah={iqamah} />
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        It is He who shows you lightning, [causing] fear and aspiration, and
        generates the heavy clouds. (Ar-Ra&apos;d: 12)
      </blockquote>
    </PageShell>
  );
}
