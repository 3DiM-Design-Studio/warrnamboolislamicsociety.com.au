import { CalendarDays, Clock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PrayerTimetable } from "@/components/prayer-timetable";
import { prayerNotes } from "@/content/site";

export const metadata = { title: "Prayer Times" };

export default function PrayerTimes() {
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
        {prayerNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <PrayerTimetable />
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        It is He who shows you lightning, [causing] fear and aspiration, and
        generates the heavy clouds. (Ar-Ra&apos;d: 12)
      </blockquote>
    </PageShell>
  );
}
