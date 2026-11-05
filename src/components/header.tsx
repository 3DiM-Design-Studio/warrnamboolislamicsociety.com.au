"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo-mark";
import { nav, site } from "@/content/site";

export function Banner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 bg-brand-dark px-4 py-4 text-center text-base text-white/90 sm:text-lg">
      <span>Non Profit Organisation</span>
      <span className="text-white/40">|</span>
      <span lang="ar" dir="rtl" className="text-3xl leading-none">﷽</span>
      <span className="text-white/40">|</span>
      <span>In the name of Allah, the Most Gracious, the Most Merciful</span>
    </div>
  );
}

// Sticky. On the home page it floats over the hero until the page scrolls.
export function Header() {
  const isHome = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = isHome && !scrolled;

  return (
    <header
      className={`sticky z-50 ${isHome ? "-top-8 h-[120px] pt-12" : "top-0 h-[88px] pt-4"}`}
    >
      <div
        className={`mx-auto max-w-6xl ${isHome ? "px-6 sm:px-10" : "px-4"}`}
      >
        <div
          className={`flex h-14 items-center justify-between gap-3 rounded-full px-3 pl-4 transition-colors ${
            overHero
              ? "text-white"
              : "bg-white/90 backdrop-blur"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LogoMark className="size-9" />
            <span className="hidden sm:inline">{site.name}</span>
          </Link>
          <nav className="hidden items-center gap-x-5 text-sm font-medium lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:underline">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/donate"
            className="rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-brand-dark hover:brightness-95"
          >
            Donate now
          </Link>
        </div>
      </div>
    </header>
  );
}
