import { ArrowLeft, CalendarDays, CalendarPlus, Clock, ExternalLink, MapPin, User, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";
import { ShareButtons } from "@/components/share-buttons";
import { getEvent, getToday } from "@/lib/content";
import { eventDateText, eventPhase, googleCalendarLink } from "@/lib/event-dates";
import { eventTypeLabel } from "@/lib/event-types";
import { fmtHM } from "@/lib/prayer";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event not found" };
  const description = event.short_description || undefined;
  return {
    title: event.title,
    description,
    openGraph: { type: "website" as const, title: event.title, description, images: [event.photo_url || "/opengraph-image"] },
  };
}

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  return (
    <Suspense fallback={<PageShell title="Loading" crumb="Event">{null}</PageShell>}>
      <Event params={params} />
    </Suspense>
  );
}

async function Event({ params }: { params: PageProps<"/events/[id]">["params"] }) {
  const { id } = await params;
  const [event, today] = await Promise.all([getEvent(id), getToday()]);
  if (!event) notFound();

  const start = fmtHM(event.event_time.slice(0, 5));
  const end = event.end_time ? fmtHM(event.end_time.slice(0, 5)) : null;
  const cancelled = event.status === "cancelled";
  const phase = eventPhase(event, today);
  const pageUrl = `${SITE_URL}/events/${event.id}`;

  const row = "flex items-start gap-3";
  const icon = "mt-0.5 size-5 shrink-0 text-brand-dark";

  return (
    <PageShell title={event.title} crumb="Event" parent={{ label: "Events", href: "/events" }} intro={event.short_description || undefined}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: `${event.event_date}T${event.event_time.slice(0, 5)}`,
          ...(event.end_date || event.end_time ? { endDate: `${event.end_date ?? event.event_date}T${(event.end_time ?? event.event_time).slice(0, 5)}` } : {}),
          eventStatus: cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          ...(event.place ? { location: { "@type": "Place", name: event.place, address: "Warrnambool, Victoria, Australia" } } : {}),
          ...(event.short_description ? { description: event.short_description } : {}),
          ...(event.photo_url ? { image: [event.photo_url] } : {}),
          organizer: { "@type": "Organization", name: "Warrnambool Islamic Society" },
        }}
      />
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {cancelled && <p className="rounded-2xl bg-[#fbe4e1] p-4 font-semibold text-[#b3261e]">This event has been cancelled.</p>}
          {!cancelled && phase === "past" && <p className="rounded-2xl bg-[#ecece5] p-4 font-semibold text-brand-dark">This event has finished. Take a look at our upcoming events for what is next.</p>}
          {!cancelled && phase === "ongoing" && <p className="rounded-2xl bg-[#dcf1e8] p-4 font-semibold text-[#0f6a4d]">This event is on now.</p>}
          {event.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.photo_url} alt="" className="w-full rounded-2xl" />
          )}
          {event.description && <p className="whitespace-pre-line text-lg leading-relaxed">{event.description}</p>}
          {event.notes && (
            <div className="rounded-2xl bg-card p-5">
              <p className="font-bold">Good to know</p>
              <p className="mt-1 whitespace-pre-line text-muted">{event.notes}</p>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl bg-card p-6">
          <span className="inline-flex rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-brand-dark">{eventTypeLabel(event.event_type)}</span>
          <div className={row}>
            <CalendarDays className={icon} aria-hidden />
            <span>{eventDateText(event, true)}</span>
          </div>
          <div className={row}>
            <Clock className={icon} aria-hidden />
            <span>
              {start}
              {end && <> to {end}</>}
            </span>
          </div>
          <div className={row}>
            <MapPin className={icon} aria-hidden />
            <span>{event.place}</span>
          </div>
          {event.speaker && (
            <div className={row}>
              <User className={icon} aria-hidden />
              <span>{event.speaker}</span>
            </div>
          )}
          {event.audience && (
            <div className={row}>
              <Users className={icon} aria-hidden />
              <span>{event.audience}</span>
            </div>
          )}
          <div className="grid gap-3 border-t border-border pt-4">
            {!cancelled && phase !== "past" && (
              <div className="flex flex-wrap gap-2">
                <a href={`/events/${event.id}/calendar`} className="btn-primary text-sm">
                  <CalendarPlus className="size-4" aria-hidden />
                  Add to calendar
                </a>
                <a href={googleCalendarLink(event, pageUrl)} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                  Google Calendar
                </a>
              </div>
            )}
            {event.map_url && (
              <a href={event.map_url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-fit text-sm">
                <ExternalLink className="size-4" aria-hidden />
                Open in Maps
              </a>
            )}
            <div>
              <p className="mb-2 text-sm font-semibold">Share this event</p>
              <ShareButtons title={event.title} />
            </div>
          </div>
        </aside>
      </div>
      <div className="pt-6">
        <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold link-fx">
          <ArrowLeft className="size-4" aria-hidden />
          All events
        </Link>
      </div>
    </PageShell>
  );
}
