import { CalendarDays, Clock } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { PrayerTimetable } from "@/components/prayer-timetable";
import { PrayerSkeleton, Skeleton } from "@/components/skeletons";
import { prayerNotes } from "@/content/site";
import { getJumuah, getTodayIqamah } from "@/lib/content";

export const metadata = { title: "Prayer Times" };

// Everything below the heading comes from the database (Iqamah times and the Jumu'ah season), so it loads on its own.
async function PrayerBody() {
  const [iqamah, jumuah] = await Promise.all([getTodayIqamah(), getJumuah()]);
  // The Jumu'ah line comes from the admin (seasons), so it always matches the time on the home page.
  const notes = prayerNotes.map((n) =>
    n.includes("Jumu'ah")
      ? `Jumu'ah prayer is conducted every Friday${jumuah.today ? ` at ${jumuah.today}` : ""}.`
      : n,
  );
  return (
    <>
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
    </>
  );
}

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
      <Suspense
        fallback={
          <>
            <div aria-hidden className="grid gap-2 pl-5">
              {["max-w-lg", "max-w-md", "max-w-sm"].map((w) => (
                <div key={w} className="flex h-6 items-center">
                  <Skeleton className={`h-4 w-full ${w}`} />
                </div>
              ))}
            </div>
            <PrayerSkeleton />
          </>
        }
      >
        <PrayerBody />
      </Suspense>
    </PageShell>
  );
}
