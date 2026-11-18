import { CalendarDays, Users } from "lucide-react";
import { Suspense } from "react";
import { ContactCta } from "@/components/contact-cta";
import { PageShell } from "@/components/page-shell";
import { EventsGrid } from "@/components/events-grid";
import { CardsSkeleton } from "@/components/skeletons";
import { EventCard } from "@/components/story-cards";
import { getPastEvents, getToday, getUpcomingEvents } from "@/lib/content";

export const metadata = { title: "Events" };

// Upcoming events (and multi-day events that are on right now) first, then a short list of recent past events.
async function EventsList() {
  const [events, past, today] = await Promise.all([getUpcomingEvents(), getPastEvents(6), getToday()]);
  return (
    <div className="space-y-14">
      <section aria-labelledby="upcoming-events">
        <h2 id="upcoming-events" className="mb-5 text-2xl font-bold">
          Upcoming events
        </h2>
        {events.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-muted">No events are planned right now. Please check back soon, or see what we have done recently below.</p>
        ) : (
          <EventsGrid events={events} today={today} />
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-events">
          <h2 id="past-events" className="mb-1 text-2xl font-bold">
            Past events
          </h2>
          <p className="mb-5 text-sm text-muted">Recent events that have finished.</p>
          <div className="reveal-cards grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} today={today} />
            ))}
          </div>
        </section>
      )}
    </div>
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
      <ContactCta title="Want to host or suggest an event?" text="Have an idea for a talk, class or gathering? Tell us and we will help make it happen." button="Share your idea" />
    </PageShell>
  );
}
