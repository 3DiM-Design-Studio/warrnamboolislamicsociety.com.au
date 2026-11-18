// Quiet "loading" shapes that sit where real content will appear. They copy the size of the real cards
// (see story-cards.tsx and prayer-timetable.tsx) so nothing jumps when the content arrives.
// The soft shimmer is in globals.css (.skeleton) and stops for visitors who prefer less motion.

/** `inline` makes it a <span>, for places inside text (a <p> may not contain a <div>). */
export function Skeleton({ className = "", style, inline = false }: { className?: string; style?: React.CSSProperties; inline?: boolean }) {
  const Tag = inline ? "span" : "div";
  return <Tag aria-hidden className={`skeleton ${className}`} style={style} />;
}

/** Tells screen readers something is loading, without reading out every grey shape. */
function Busy({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

const cover = "aspect-[16/10] rounded-none";

/** Same frame as PostCard: picture, date chip, headline (2 lines), short text (2 lines). */
export function PostCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col overflow-hidden rounded-2xl bg-card">
      <Skeleton className={cover} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-6 w-28 rounded-full" />
        <div className="grid gap-2 py-0.5">
          <Skeleton className="h-[1.15rem] w-full" />
          <Skeleton className="h-[1.15rem] w-3/4" />
        </div>
        <div className="grid gap-2 py-0.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <div className="pt-1">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/** Same frame as EventCard: picture, type chip, title, three detail lines, "View details". */
export function EventCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col overflow-hidden rounded-2xl bg-card">
      <Skeleton className={cover} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-6 w-24 rounded-full" />
        <div className="grid gap-2 py-0.5">
          <Skeleton className="h-[1.15rem] w-full" />
          <Skeleton className="h-[1.15rem] w-2/3" />
        </div>
        <div className="grid gap-1.5">
          {[55, 40, 65].map((w) => (
            <div key={w} className="flex h-5 items-center gap-2">
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <Skeleton className="h-3.5" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="pt-1">
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

/** Same frame as FeaturedPost: large picture beside the headline. */
export function FeaturedPostSkeleton() {
  return (
    <div aria-hidden className="grid overflow-hidden rounded-3xl bg-card md:grid-cols-[1.25fr_1fr]">
      <Skeleton className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-80" />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div>
          <div className="flex h-[1.875rem] items-center sm:h-[2.35rem]"><Skeleton className="h-5 w-full sm:h-6" /></div>
          <div className="flex h-[1.875rem] items-center sm:h-[2.35rem]"><Skeleton className="h-5 w-11/12 sm:h-6" /></div>
          <div className="flex h-[1.875rem] items-center sm:h-[2.35rem] lg:hidden"><Skeleton className="h-5 w-2/3 sm:h-6" /></div>
        </div>
        <div>
          {["w-full", "w-full", "w-11/12", "w-2/3"].map((w, i) => (
            <div key={i} className="flex h-6 items-center"><Skeleton className={`h-4 ${w}`} /></div>
          ))}
        </div>
        <div className="flex h-6 items-center"><Skeleton className="h-4 w-28" /></div>
      </div>
    </div>
  );
}

/** A row of card skeletons with a screen-reader label. `className` is the same grid the real cards use. */
export function CardsSkeleton({
  kind,
  count,
  label,
  className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: {
  kind: "post" | "event";
  count: number;
  label: string;
  className?: string;
}) {
  const Card = kind === "post" ? PostCardSkeleton : EventCardSkeleton;
  return (
    <Busy label={label} className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} />
      ))}
    </Busy>
  );
}

/** Heading row ("Upcoming events" + link) for a home section whose cards are still loading. */
export function SectionHeadingSkeleton() {
  return (
    <div aria-hidden className="flex items-baseline justify-between">
      <Skeleton className="h-9 w-64 max-w-[60%]" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** Today's times and the calendar box on the Prayer Times page. */
export function PrayerSkeleton() {
  return (
    <Busy label="Loading prayer times" className="space-y-10">
      <section aria-hidden className="rounded-2xl bg-card p-6">
        <Skeleton className="h-4 w-60 max-w-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-xl bg-background p-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="mt-2.5 h-6 w-20" />
              <Skeleton className="mt-2.5 h-3 w-24" />
            </div>
          ))}
        </div>
      </section>
      <section aria-hidden>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex min-h-10 items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-[40rem] overflow-hidden rounded-2xl border border-border bg-white p-4">
          <div className="grid h-full grid-cols-[3.5rem_1fr] gap-4 sm:grid-cols-[3.5rem_repeat(3,1fr)] md:grid-cols-[3.5rem_repeat(7,1fr)]">
            <div className="grid content-start gap-10 pt-12">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`flex flex-col gap-3 ${i > 0 ? "hidden sm:flex" : ""} ${i > 2 ? "sm:hidden md:flex" : ""}`}>
                <Skeleton className="h-8 w-full" />
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <Skeleton key={n} className="h-[4.25rem] w-full shrink-0 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex h-4 items-center">
          <Skeleton className="h-3 w-2/3 max-w-md" />
        </div>
      </section>
    </Busy>
  );
}

/** FAQ list: a few closed rows. */
export function FaqSkeleton() {
  return (
    <Busy label="Loading questions">
      <div aria-hidden>
        <Skeleton className="h-9 w-80 max-w-full" />
        <div className="mt-6 divide-y divide-border rounded-2xl bg-card">
          {[70, 55, 80, 60].map((w) => (
            <div key={w} className="flex h-16 items-center justify-between p-5">
              <Skeleton className="h-4" style={{ width: `${w}%` }} />
              <Skeleton className="size-4 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  );
}

/** A whole public page while it loads: breadcrumb, big heading, intro and a row of cards (same frame as PageShell). */
export function PageSkeleton() {
  return (
    <Busy label="Loading page" className="mx-auto max-w-6xl px-4 pt-10">
      <div aria-hidden>
        <div className="flex h-9 items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-8 grid gap-3">
          <Skeleton className="h-10 w-4/5 sm:h-14 sm:w-2/3" />
          <Skeleton className="h-10 w-3/5 sm:h-14 sm:w-1/2" />
        </div>
        <Skeleton className="mt-5 h-5 w-full max-w-2xl" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <div className="hidden sm:block lg:block">
            <PostCardSkeleton />
          </div>
        </div>
      </div>
    </Busy>
  );
}

/** What an admin page looks like while it loads: number cards, then a card with a toolbar and rows. */
export function AdminPageSkeleton() {
  return (
    <Busy label="Loading page" className="grid gap-5">
      <div aria-hidden className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-4 h-7 w-16" />
          </div>
        ))}
      </div>
      <div aria-hidden className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <Skeleton className="mt-5 h-11 w-full rounded-xl" />
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex h-14 items-center gap-4 rounded-xl border border-border px-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="hidden h-8 w-20 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  );
}

/** The admin panel's first load: dark menu on the left (large screens) and the page skeleton beside it. */
export function AdminShellSkeleton() {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[250px_minmax(0,1fr)]">
      <div aria-hidden className="hidden bg-brand-dark lg:block" />
      <div className="flex min-w-0 flex-col">
        <div aria-hidden className="flex items-center gap-3 px-4 pb-2 pt-5 sm:px-8">
          <Skeleton className="size-11 rounded-full lg:hidden" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="mx-auto w-full max-w-[1160px] px-4 pt-3 sm:px-8">
          <AdminPageSkeleton />
        </div>
      </div>
    </div>
  );
}
