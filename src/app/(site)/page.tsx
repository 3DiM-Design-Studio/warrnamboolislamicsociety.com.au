import Image from "next/image";
import Link from "next/link";
import { AcncBadge } from "@/components/acnc-badge";
import { FridayCalendar } from "@/components/friday-calendar";
import { HeroGreeting } from "@/components/hero-greeting";
import { mission, site } from "@/content/site";
import { getJumuah, getPosts, getUpcomingEvents } from "@/lib/content";
import { fmtHM } from "@/lib/prayer";

const faqs = [
  {
    q: "When is Jumu'ah?",
    a: "Jumu'ah is every Friday. The time can change by season, so check the prayer times page.",
  },
  {
    q: "How can I donate?",
    a: "Use the donate page. Online card donations are being set up; until then contact the committee for bank details.",
  },
  {
    q: "Is WIS a registered charity?",
    a: "Yes. Warrnambool Islamic Society is registered with the Australian Charities and Not-for-profits Commission (ACNC).",
  },
  {
    q: "How do I become a member?",
    a: "Visit the membership page or contact the committee and we will help you register.",
  },
  {
    q: "Who can attend?",
    a: "Everyone. We welcome people of all backgrounds to visit and show their support.",
  },
];

const featureImages = [
  "/cards/services.png",
  "/cards/education.png",
  "/cards/empowerment.png",
];
const features = mission.slice(0, 3);

export default async function Home() {
  const [posts, jumuah, events] = await Promise.all([getPosts(), getJumuah(), getUpcomingEvents()]);
  return (
    <>
      <div className="mx-auto -mt-[120px] max-w-6xl px-4 pt-8">
        <div className="relative mb-12 sm:mb-16">
          <section className="relative isolate overflow-hidden rounded-3xl bg-brand-dark text-white">
            <Image
              src="/hero.jpeg"
              alt="Mosque reflected in still water at sunrise"
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="-z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
            <div className="flex min-h-[34rem] flex-col justify-end p-6 pb-20 pt-44 sm:min-h-[42rem] sm:p-10 sm:pb-24 sm:pt-52">
              <div className="grid items-end gap-6 md:grid-cols-[1fr_22rem]">
                <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
                  {site.name}
                </h1>
                <div>
                  <HeroGreeting />
                  <p className="text-white/85">{site.tagline}</p>
                  <Link
                    href="/donate"
                    className="mt-4 inline-block rounded-full bg-brand-gradient px-6 py-3 font-semibold text-brand-dark"
                  >
                    Start giving
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <AcncBadge />
        </div>

        <section className="pt-16">
          <h2 className="text-3xl font-bold">
            Serving Warrnambool, with sincerity.
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            {site.name} serves our community through service, education and
            empowerment, guided by compassion, unity and justice.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`flex h-full flex-col overflow-hidden rounded-2xl px-6 pt-6 bg-card`}
              >
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-brand-dark/70">
                  {f.short ?? f.body}
                </p>
                <div className="relative -mx-6 mt-auto aspect-[3/2] w-[calc(100%+3rem)] shrink-0 pt-4">
                  <Image
                    src={featureImages[i]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="feature-fade object-cover object-bottom"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-bold">Latest from the community</h2>
            <Link href="/news" className="text-sm font-medium underline">
              All news
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {posts.slice(0, 3).map((p, i) => (
              <Link
                key={p.id}
                href={`/news/${p.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-card p-6 transition hover:-translate-y-0.5"
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${i === 0 ? "bg-brand-gradient" : "bg-background"}`}
                  >
                    {p.post_date}
                  </span>
                  <h3 className="mt-4 font-bold">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">
                    {p.preview}
                  </p>
                </div>
                <span className="mt-6 text-sm font-semibold group-hover:underline">
                  Read more
                </span>
              </Link>
            ))}
          </div>
        </section>

        {events.length > 0 && (
          <section className="pt-16">
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold">Upcoming events</h2>
              <Link href="/events" className="text-sm font-medium underline">
                All events
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {events.slice(0, 3).map((e) => (
                <div key={e.id} className="rounded-2xl bg-card p-6">
                  <span className="inline-block rounded-full bg-background px-3 py-1 text-xs font-medium">
                    {new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${e.event_date}T12:00:00Z`))}
                    {" · "}
                    {fmtHM(e.event_time.slice(0, 5))}
                  </span>
                  <h3 className="mt-4 font-bold">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted">{e.place}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="relative isolate mt-16 overflow-hidden rounded-3xl bg-card px-6 py-14 sm:px-10">
          <Image
            src="/jumuah-bg.png"
            alt=""
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="-z-10 object-cover object-top"
          />
          <div className="grid items-center gap-10 md:grid-cols-[20rem_1fr]">
            <FridayCalendar />
            <div className="text-center md:text-left">
              <p className="text-sm text-muted">
                Join us for Jumu&apos;ah, every Friday
              </p>
              <p className="mt-2 text-6xl font-bold tracking-tight sm:text-8xl">
                {jumuah.today ?? "Fridays"}
              </p>
              <p className="mt-3 max-w-md text-muted">
                Everyone is welcome. See the full prayer times for the day.
              </p>
              <Link
                href="/prayer-times"
                className="mt-6 inline-block rounded-full bg-brand-gradient px-6 py-3 font-semibold"
              >
                Prayer times
              </Link>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {f.q}
                  <span className="text-xl transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
