"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo-mark";
import { nav, site } from "@/content/site";

export function Banner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 bg-brand-dark px-4 py-3 text-center text-sm text-white/90 sm:py-4 sm:text-lg">
      <span>Non Profit Organisation</span>
      <span aria-hidden className="hidden text-white/40 sm:inline">|</span>
      <span lang="ar" dir="rtl" className="text-3xl leading-none">
        ﷽
      </span>
      <span aria-hidden className="hidden text-white/40 sm:inline">|</span>
      <span>In the name of Allah, the Most Gracious, the Most Merciful</span>
    </div>
  );
}

// Sticky. On the home page it floats over the hero until the page scrolls.
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // The phone menu is remembered together with the page it was opened on, so moving to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = isHome && !scrolled && !menuOpen;

  return (
    <header
      className={`sticky z-50 ${isHome ? "-top-8 h-[120px] pt-12" : "top-0 h-[88px] pt-4"}`}
    >
      <div className={`relative mx-auto max-w-6xl ${isHome ? "px-6 sm:px-10" : "px-4"}`}>
        <div
          className={`flex h-14 items-center justify-between gap-3 rounded-full px-3 pl-4 transition-colors ${
            overHero ? "text-white" : "bg-white/90 backdrop-blur"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LogoMark className="size-9" />
            <span className="hidden sm:inline">{site.name}</span>
          </Link>
          <nav className="hidden items-center gap-x-5 text-sm font-medium lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="link-fx">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/donate"
              className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-95"
            >
              Donate now
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setOpenOn(menuOpen ? null : pathname)}
              className="grid size-11 place-items-center rounded-full lg:hidden"
            >
              {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpenOn(null)} className="fixed inset-0 -z-10 cursor-default lg:hidden" />
        )}
        {menuOpen && (
          <nav
            aria-label="Main menu"
            className={`absolute top-full z-50 mt-2 grid rounded-3xl bg-white p-2 text-brand-dark shadow-xl lg:hidden ${isHome ? "inset-x-6 sm:inset-x-10" : "inset-x-4"}`}
          >
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={pathname === n.href ? "page" : undefined}
                className="rounded-2xl px-4 py-3.5 text-base font-medium hover:bg-background aria-[current=page]:bg-[#c9f26b]/50 aria-[current=page]:font-bold"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
