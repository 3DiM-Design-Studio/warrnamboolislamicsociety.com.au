import { PageShell } from "@/components/page-shell";
import { PrayerInsights } from "@/components/prayer-insights";
import { PrayerTimetable } from "@/components/prayer-timetable";
import { prayerNotes } from "@/content/site";

export const metadata = { title: "Prayer Times" };

export default function PrayerTimes() {
  return (
    <PageShell
      title="Prayer Times"
      intro="Please find our prayer times for Warrnambool below."
    >
      <ul className="list-disc space-y-2 pl-5">
        {prayerNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <PrayerTimetable />
      <PrayerInsights />
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        It is He who shows you lightning, [causing] fear and aspiration, and
        generates the heavy clouds. (Ar-Ra&apos;d: 12)
      </blockquote>
    </PageShell>
  );
}
