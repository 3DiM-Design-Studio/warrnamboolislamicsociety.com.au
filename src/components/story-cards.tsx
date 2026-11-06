import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
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
        <img src={src} alt="" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" />
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
          Read story <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** Standard story card: picture on top, date chip, headline, short text. */
export function PostCard({ post }: { post: PublicPost }) {
  return (
    <Link href={`/news/${post.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-card transition hover:-translate-y-0.5">
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

/** Event card: a date block beside the details. */
export function EventCard({ event }: { event: EventRow }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-card p-5">
      <div className="grid size-16 shrink-0 place-content-center rounded-2xl bg-brand-gradient text-center text-brand-dark">
        <span className="text-xs font-semibold uppercase leading-none">{dateLabel(event.event_date, { month: "short" })}</span>
        <span className="text-2xl font-bold leading-tight">{dateLabel(event.event_date, { day: "numeric" })}</span>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-bold leading-snug">{event.title}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {dateLabel(event.event_date, { weekday: "long" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {fmtHM(event.event_time.slice(0, 5))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden />
            {event.place}
          </span>
        </p>
      </div>
    </div>
  );
}
