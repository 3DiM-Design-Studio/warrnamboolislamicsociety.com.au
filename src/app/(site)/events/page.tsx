import { CalendarDays, Users } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { EventsGrid } from "@/components/events-grid";
import { CardsSkeleton } from "@/components/skeletons";
import { getUpcomingEvents } from "@/lib/content";

export const metadata = { title: "Events" };

async function EventsList() {
  const events = await getUpcomingEvents();
  return events.length === 0 ? (
    <p className="text-muted">No events are planned right now. Please check back soon.</p>
  ) : (
    <EventsGrid events={events} />
  );
}

export default function Events() {
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
      <Suspense fallback={<CardsSkeleton kind="event" count={3} label="Loading events" />}>
        <EventsList />
      </Suspense>
    </PageShell>
  );
}
