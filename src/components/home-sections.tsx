import Link from "next/link";
import { Suspense } from "react";
import { EventCard, PostCard } from "@/components/story-cards";
import { CardsSkeleton, FaqSkeleton, SectionHeadingSkeleton, Skeleton } from "@/components/skeletons";
import { NextUp } from "@/components/next-up";
import { eventDateText, eventPhase } from "@/lib/event-dates";
import { getFaqs, getJumuah, getPosts, getToday, getTodayIqamah, getUpcomingEvents } from "@/lib/content";
import { fmtHM } from "@/lib/prayer";

// Each part of the home page that reads from the database loads on its own, so the hero, the three service
// cards and the menu show straight away while these fill in (each one shows a grey placeholder meanwhile).

const grid = "mt-8 grid gap-4 sm:grid-cols-3";

async function News() {
  const posts = await getPosts();
  return (
    <>
      <div className={grid}>
        {posts.slice(0, 3).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </>
  );
}

export function HomeNews() {
  return (
    <section className="pt-16">
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl font-bold">Latest from the community</h2>
        <Link href="/news" className="inline-block py-2 text-sm font-medium link-fx">
          All news
        </Link>
      </div>
      <Suspense fallback={<CardsSkeleton kind="post" count={3} label="Loading latest news" className={grid} />}>
        <News />
      </Suspense>
    </section>
  );
}

async function Events() {
  const [events, today] = await Promise.all([getUpcomingEvents(), getToday()]);
  if (events.length === 0) return null;
  return (
    <section className="pt-16">
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl font-bold">Upcoming events</h2>
        <Link href="/events" className="inline-block py-2 text-sm font-medium link-fx">
          All events
        </Link>
      </div>
      <div className={grid}>
        {events.slice(0, 3).map((e) => (
          <EventCard key={e.id} event={e} today={today} />
        ))}
      </div>
    </section>
  );
}

// The whole section is hidden when nothing is planned, so its placeholder includes the heading.
export function HomeEvents() {
  return (
    <Suspense
      fallback={
        <section className="pt-16">
          <SectionHeadingSkeleton />
          <CardsSkeleton kind="event" count={3} label="Loading upcoming events" className={grid} />
        </section>
      }
    >
      <Events />
    </Suspense>
  );
}

async function Time() {
  const jumuah = await getJumuah();
  return <>{jumuah.today ?? "Fridays"}</>;
}

/** The big Jumu'ah time. The text size is set by the parent, so the placeholder is measured in "em". */
export function HomeJumuahTime() {
  return (
    <Suspense fallback={<Skeleton inline className="inline-block h-[0.72em] w-[3.4em] rounded-xl align-middle" />}>
      <Time />
    </Suspense>
  );
}

async function Faqs() {
  const faqs = await getFaqs("home");
  if (faqs.length === 0) return null;
  return (
    <section className="pt-16">
      <h2 className="text-3xl font-bold">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-border rounded-2xl bg-card">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {f.q}
              <span className="text-xl transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function HomeFaqs() {
  return (
    <Suspense
      fallback={
        <section className="pt-16">
          <FaqSkeleton />
        </section>
      }
    >
      <Faqs />
    </Suspense>
  );
}

async function NextUpData() {
  const [iqamah, events, today] = await Promise.all([getTodayIqamah(), getUpcomingEvents(), getToday()]);
  const e = events[0];
  return (
    <NextUp
      iqamah={iqamah}
      event={
        e
          ? { id: e.id, title: e.title, when: eventDateText(e), time: fmtHM(e.event_time.slice(0, 5)), place: e.place, ongoing: eventPhase(e, today) === "ongoing" }
          : null
      }
    />
  );
}

/** The next prayer and the next event, just under the top picture. */
export function HomeNextUp() {
  return (
    <Suspense
      fallback={
        <div role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2">
          <span className="sr-only">Loading the next prayer and event</span>
          {[0, 1].map((i) => (
            <div key={i} aria-hidden className="flex items-center gap-4 rounded-2xl bg-card p-5 sm:p-6">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      }
    >
      <NextUpData />
    </Suspense>
  );
}
