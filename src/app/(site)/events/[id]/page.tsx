import { CalendarDays, Clock, ExternalLink, MapPin, User, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { getEvent } from "@/lib/content";
import { eventTypeLabel } from "@/lib/event-types";
import { fmtHM } from "@/lib/prayer";

const dateLabel = (d: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await getEvent(id);
  return { title: event?.title ?? "Event" };
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
  const event = await getEvent(id);
  if (!event) notFound();

  const start = fmtHM(event.event_time.slice(0, 5));
  const end = event.end_time ? fmtHM(event.end_time.slice(0, 5)) : null;
  const multiDay = event.end_date && event.end_date !== event.event_date;
  const cancelled = event.status === "cancelled";

  const row = "flex items-start gap-3";
  const icon = "mt-0.5 size-5 shrink-0 text-brand-dark";

  return (
    <PageShell title={event.title} crumb="Event" parent={{ label: "Events", href: "/events" }} intro={event.short_description || undefined}>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {cancelled && <p className="rounded-2xl bg-[#fbe4e1] p-4 font-semibold text-[#b3261e]">This event has been cancelled.</p>}
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
            <span>
              {dateLabel(event.event_date)}
              {multiDay && event.end_date && <> to {dateLabel(event.end_date)}</>}
            </span>
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
          <div className="flex flex-wrap gap-2 pt-2">
            {event.map_url && (
              <a
                href={event.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-dark"
              >
                <ExternalLink className="size-4" aria-hidden />
                Open in Maps
              </a>
            )}
            <WhatsAppShare title={event.title} />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
