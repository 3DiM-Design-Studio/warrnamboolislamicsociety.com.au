import { ArrowRight, ArrowUp, HeartHandshake, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GradientWaves from "@/components/GradientWaves";
import { SubscribeForm } from "@/components/subscribe-form";
import { nav, site } from "@/content/site";
import { getSettings } from "@/lib/content";

const support = [
  { href: "/acnc", label: "ACNC registration" },
  { href: "/privacy-policy", label: "Privacy policy" },
];

export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="relative isolate mt-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <GradientWaves
          horizonColor="#0b5d3b"
          waveColor="#00bf2e"
          crestColor="#c9f26b"
          speed={0.4}
          amplitude={2.5}
          relief={1}
          lightAngle={120}
          mouseInteraction
          swellOnClick
          lightMode={false}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={64}
          zoom={1}
          height={5.5}
          fogDepth={15}
          sheen={0}
          brightness={1}
          opacity={1}
          grain={0.2}
          quality="medium"
          intro
          parallaxStrength={0.5}
          mouseStrength={0.6}
          paused={false}
          style={{}}
        />
      </div>
      {/* No minimum height: the card sets the footer's height, so there is no empty gap above it. */}
      <div className="mx-auto flex max-w-6xl flex-col justify-end px-4 pb-8 pt-4">
        <div className="rounded-xl border border-white/40 bg-white/90 p-8 backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="flex flex-col gap-12">
              <div className="max-w-sm">
                <h2 className="text-2xl font-bold uppercase leading-tight tracking-tight sm:text-3xl">
                  Get community news and updates in your inbox.
                </h2>
                <div className="mt-8">
                  <SubscribeForm />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 text-sm sm:flex-row sm:items-center sm:gap-5">
                <Link
                  href="/news/wis-registered-charity-acnc"
                  aria-label="Registered charity with the ACNC"
                  className="shrink-0"
                >
                  <Image
                    src="/acnc-logo.png"
                    alt="ACNC Registered Charity"
                    width={960}
                    height={816}
                    className="h-24 w-auto"
                  />
                </Link>
                <div className="min-w-0">
                  <p className="font-bold">{site.name}</p>
                  <p className="mt-1 text-brand-dark/70">
                    Registered charity with the ACNC.
                  </p>
                  <p className="mt-3 flex items-center gap-2 break-all">
                    <Mail className="size-4 shrink-0" aria-hidden />
                    {settings.email}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Phone className="size-4 shrink-0" aria-hidden />
                    {settings.phones[0]}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-bold">Support</p>
              <Link
                href="/donate"
                className="group mt-4 block rounded-xl border-2 border-brand-dark p-4 transition-colors hover:bg-brand-dark hover:text-white"
              >
                <span className="flex items-center gap-2 font-bold">
                  <HeartHandshake className="size-5" aria-hidden />
                  Donate
                </span>
                <span className="mt-1 block text-xs opacity-70">
                  Help build a permanent place of worship.
                </span>
                <span className="mt-3 flex items-center gap-1.5 font-semibold">
                  Give now
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
              <p className="mt-4 flex flex-col items-start">
                {support.map((n) => (
                  <Link key={n.href} href={n.href} className="link-fx py-2.5 lg:py-1">
                    {n.label}
                  </Link>
                ))}
              </p>
            </div>

            <div className="flex flex-col justify-between gap-10 text-sm">
              <div>
                <p className="font-bold">Menu</p>
                <p className="mt-3 flex flex-col items-start">
                  {nav.map((n) => (
                    <Link key={n.href} href={n.href} className="link-fx py-2.5 lg:py-1">
                      {n.label}
                    </Link>
                  ))}
                </p>
              </div>
              <a
                href="#top"
                aria-label="Back to top"
                className="grid size-11 place-items-center self-end rounded-full bg-brand-dark text-white"
              >
                <ArrowUp className="size-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-white drop-shadow">
          &copy; {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
