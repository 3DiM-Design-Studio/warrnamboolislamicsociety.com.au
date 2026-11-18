import Link from "next/link";
import { Suspense } from "react";
import { EventCard, PostCard } from "@/components/story-cards";
import { CardsSkeleton, FaqSkeleton, SectionHeadingSkeleton, Skeleton } from "@/components/skeletons";
import { getFaqs, getJumuah, getPosts, getUpcomingEvents } from "@/lib/content";

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
  const events = await getUpcomingEvents();
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
          <EventCard key={e.id} event={e} />
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
