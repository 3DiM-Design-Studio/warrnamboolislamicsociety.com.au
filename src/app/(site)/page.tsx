import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AcncBadge } from "@/components/acnc-badge";
import { FridayCalendar } from "@/components/friday-calendar";
import { HeroGreeting } from "@/components/hero-greeting";
import { mission, site } from "@/content/site";
import { HomeGallery } from "@/components/home-gallery";
import { JoinCommunity } from "@/components/join-community";
import { HomeEvents, HomeFaqs, HomeJumuahTime, HomeNews, HomeNextUp } from "@/components/home-sections";

const featureImages = [
  "/cards/services.png",
  "/cards/education.png",
  "/cards/empowerment.png",
];
const features = mission.slice(0, 3);

export default function Home() {
  return (
    <>
      <div className="mx-auto -mt-[120px] max-w-6xl px-4 pt-8">
        <div className="relative mb-24 sm:mb-28">
          <section className="relative isolate overflow-hidden rounded-3xl bg-brand-dark text-white">
            <Image
              src="/hero.jpeg"
              alt="Mosque reflected in still water at sunrise"
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="hero-parallax -z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
            <div className="flex min-h-[36rem] flex-col justify-end px-5 pb-28 pt-44 sm:min-h-[42rem] sm:p-10 sm:pb-24 sm:pt-52">
              <div className="grid items-end gap-6 md:grid-cols-[1fr_22rem]">
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-7xl">
                  {site.name}
                </h1>
                <div>
                  <HeroGreeting />
                  <p className="text-white/85">{site.tagline}</p>
                  <Link
                    href="/donate"
                    className="btn-primary mt-5 w-full sm:w-auto"
                  >
                    Start giving
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <AcncBadge />
        </div>

        <HomeNextUp />

        <section className="pt-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Serving Warrnambool, with sincerity.
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            {site.name} serves our community through service, education and
            empowerment, guided by compassion, unity and justice.
          </p>
          <div className="reveal-cards mt-8 grid gap-4 sm:grid-cols-3">
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
                    className="feature-fade feature-art object-contain object-bottom"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <HomeNews />

        <HomeEvents />

        <Suspense fallback={null}>
          <HomeGallery />
        </Suspense>

        <section className="relative isolate mt-16 overflow-hidden rounded-3xl bg-card px-6 py-8 sm:px-10">
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
            <Image
              src="/jumuah-bg.png"
              alt=""
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="grid items-center gap-10 md:grid-cols-[24rem_1fr]">
            <FridayCalendar />
            <div className="text-center md:text-left">
              <p className="text-sm text-muted">
                Join us for Jumu&apos;ah, every Friday
              </p>
              <p className="mt-2 text-[2.75rem] font-bold leading-none tracking-tight sm:text-8xl">
                <HomeJumuahTime />
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

        <HomeFaqs />

        <Suspense fallback={null}>
          <JoinCommunity />
        </Suspense>
      </div>
    </>
  );
}
