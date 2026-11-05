import { PageShell } from "@/components/page-shell";
import { prayerNotes, site } from "@/content/site";

export const metadata = { title: "Prayer Times" };

export default function PrayerTimes() {
  return (
    <PageShell title="Prayer Times" intro="Please find our prayer times for Warrnambool below.">
      <ul className="list-disc space-y-2 pl-5">
        {prayerNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <p className="rounded-lg border border-border bg-card p-4">
        Jumu&apos;ah: <strong>{site.jumuah}</strong>
      </p>
      <p className="text-sm text-muted">
        The daily timetable is published through Masjidal (warrnambool.is). A live embed
        needs the widget code from the Masjidal dashboard and is not added yet.
      </p>
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        It is He who shows you lightning, [causing] fear and aspiration, and generates the
        heavy clouds. (Ar-Ra&apos;d: 12)
      </blockquote>
    </PageShell>
  );
}
