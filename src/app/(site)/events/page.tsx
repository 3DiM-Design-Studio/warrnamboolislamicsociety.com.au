import { CalendarDays, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { EventsGrid } from "@/components/events-grid";
import { getUpcomingEvents } from "@/lib/content";

export const metadata = { title: "Events" };

export default async function Events() {
  const events = await getUpcomingEvents();
  return (
    <PageShell
      title="What is coming up in our community."
      crumb="Events"
      highlight="coming up"
      icons={{
        events: <CalendarDays className="size-[0.75em]" aria-hidden />,
        community: <Users className="size-[0.75em]" aria-hidden />,
      }}
      intro="Gatherings, talks and programs at Warrnambool Islamic Society. Everyone is welcome."
    >
      {events.length === 0 ? (
        <p className="text-muted">No events are planned right now. Please check back soon.</p>
      ) : (
        <EventsGrid events={events} />
      )}
    </PageShell>
  );
}
