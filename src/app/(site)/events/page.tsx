import { PageShell } from "@/components/page-shell";
import { getUpcomingEvents } from "@/lib/content";
import { fmtHM } from "@/lib/prayer";

export const metadata = { title: "Events" };

export default async function Events() {
  const events = await getUpcomingEvents();
  return (
    <PageShell title="Events" intro="What is coming up at Warrnambool Islamic Society.">
      {events.length === 0 ? (
        <p className="text-muted">No events are planned right now. Please check back soon.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {events.map((e) => (
            <li key={e.id} className="p-4">
              <p className="text-xs text-muted">
                {new Intl.DateTimeFormat("en-AU", {
                  timeZone: "UTC",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(`${e.event_date}T12:00:00Z`))}
                {" · "}
                {fmtHM(e.event_time.slice(0, 5))}
              </p>
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-muted">{e.place}</p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
