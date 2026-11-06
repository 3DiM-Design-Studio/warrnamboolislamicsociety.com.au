import { CalendarDays, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { EventCard } from "@/components/story-cards";
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
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
