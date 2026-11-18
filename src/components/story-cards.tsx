import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { eventDateText, eventPhase } from "@/lib/event-dates";
import { eventTypeLabel } from "@/lib/event-types";
import type { PublicPost } from "@/lib/content";
import { fmtHM } from "@/lib/prayer";
import type { EventRow } from "@/lib/types";

const dateLabel = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", ...opts }).format(new Date(`${d}T12:00:00Z`));

/** Cover picture, or a soft green tile with the logo when a post has no photo. */
function Cover({ src, className = "" }: { src: string | null; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#dff3cf] ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#dff3cf] to-[#cdeee3]">
          <LogoMark className="size-14 opacity-60" />
        </div>
      )}
    </div>
  );
}

const Chip = ({ children, solid }: { children: React.ReactNode; solid?: boolean }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${solid ? "bg-brand-gradient text-brand-dark" : "bg-background text-brand-dark/70"}`}>
    {children}
  </span>
);

/** Large lead story: big picture beside the headline. */
export function FeaturedPost({ post }: { post: PublicPost }) {
  return (
    <Link href={`/news/${post.slug}`} className="group grid overflow-hidden rounded-3xl bg-card md:grid-cols-[1.25fr_1fr]">
      <Cover src={post.photo_url} className="aspect-[16/10] md:aspect-auto md:min-h-80" />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Chip solid>{post.pinned ? "Featured" : "Latest"}</Chip>
          <Chip>{dateLabel(post.post_date, { day: "numeric", month: "short", year: "numeric" })}</Chip>
        </div>
        <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{post.title}</h2>
        <p className="line-clamp-4 text-muted">{post.preview}</p>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          Read story <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Standard story card: picture on top, date chip, headline, short text. */
export function PostCard({ post }: { post: PublicPost }) {
  return (
    <Link href={`/news/${post.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-card">
      <Cover src={post.photo_url} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.pinned && <Chip solid>Featured</Chip>}
          <Chip>{dateLabel(post.post_date, { day: "numeric", month: "short", year: "numeric" })}</Chip>
        </div>
        <h3 className="line-clamp-3 text-lg font-bold leading-snug">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{post.preview}</p>
      </div>
    </Link>
  );
}

/**
 * Event card: picture on top, type chip, title, date, time, place and a link to the details.
 * Give it today's date (YYYY-MM-DD) and it also says "On now" for a running multi-day event, or "Finished" for a past one.
 */
export function EventCard({ event, today }: { event: EventRow; today?: string }) {
  const phase = today ? eventPhase(event, today) : "upcoming";
  const past = phase === "past";
  return (
    <Link href={`/events/${event.id}`} className={`group flex flex-col overflow-hidden rounded-2xl bg-card ${past ? "opacity-85" : ""}`}>
      <Cover src={event.photo_url} className={`aspect-[16/10] ${past ? "grayscale-[0.6]" : ""}`} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip solid>{eventTypeLabel(event.event_type)}</Chip>
          {phase === "ongoing" && <span className="inline-flex items-center rounded-full bg-brand-dark px-3 py-1 text-xs font-semibold text-accent">On now</span>}
          {past && <Chip>Finished</Chip>}
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug">{event.title}</h3>
        <div className="grid gap-1.5 text-sm text-muted">
          <span className="inline-flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
            {eventDateText(event)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden />
            {fmtHM(event.event_time.slice(0, 5))}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="line-clamp-1">{event.place}</span>
          </span>
        </div>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold">
          View details <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
