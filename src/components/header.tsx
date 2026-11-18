"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/logo-mark";
import { isCurrent } from "@/components/nav-link";
import { nav, site } from "@/content/site";

// One line of the banner, repeated so the moving strip on phones can loop without a gap.
function BannerLine() {
  return (
    <span className="flex shrink-0 items-center gap-5 pr-5 text-sm whitespace-nowrap">
      <span>Non Profit Organisation</span>
      <span aria-hidden className="text-white/35">
        |
      </span>
      <span lang="ar" dir="rtl" className="text-2xl leading-none">
        ﷽
      </span>
      <span>In the name of Allah, the Most Gracious, the Most Merciful</span>
      <span aria-hidden className="text-white/35">
        |
      </span>
    </span>
  );
}

export function Banner() {
  return (
    <div className="bg-brand-dark text-white/90">
      {/* Phones: one slim line that slides across. It pauses when touched or hovered, and stands still for visitors who prefer less motion. */}
      <div className="banner-marquee lg:hidden" role="note" aria-label="Non Profit Organisation. In the name of Allah, the Most Gracious, the Most Merciful">
        <div className="banner-track" aria-hidden>
          <BannerLine />
          <BannerLine />
        </div>
      </div>
      <p className="banner-static px-4 py-2.5 text-center text-xs lg:hidden">
        <span lang="ar" dir="rtl" className="mr-2 align-middle text-xl leading-none">
          ﷽
        </span>
        Non Profit Organisation
      </p>
      {/* Tablet and desktop: the full banner. */}
      <div className="hidden items-center justify-center gap-x-8 px-4 py-4 text-center text-lg whitespace-nowrap lg:flex">
        <span>Non Profit Organisation</span>
        <span aria-hidden className="text-white/40">
          |
        </span>
        <span lang="ar" dir="rtl" className="text-3xl leading-none">
          ﷽
        </span>
        <span>In the name of Allah, the Most Gracious, the Most Merciful</span>
      </div>
    </div>
  );
}

// The address the visitor is really on. On some hosts the page's first HTML is made without knowing the address,
// so the router's value can be out of date until the first click. The browser's own address is always right.
const noSubscribe = () => () => {};

// Sticky. On the home page it floats over the hero until the page scrolls.
//
// How big the header is, and whether it is see-through, depends only on two marks on <html> that a tiny script
// sets before anything is drawn (see app/layout.tsx): data-home ("1" on the home page) and data-top ("1" while the
// page is at the top). Styles for them are in globals.css. That way the first frame is right on every host, and
// nothing moves when the page finishes loading.
export function Header() {
  const routerPath = usePathname();
  const path = useSyncExternalStore(noSubscribe, () => window.location.pathname, () => routerPath);
  // The phone menu is remembered together with the page it was opened on, so moving to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === path;

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Keep the "top" mark right while scrolling. A reload that restores a mid-page scroll must not show the wrong look.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const root = document.documentElement;
    const onScroll = () => {
      root.dataset.top = window.scrollY > 40 ? "0" : "1";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the "home" mark right when moving between pages without a reload.
  useLayoutEffect(() => {
    document.documentElement.dataset.home = window.location.pathname === "/" ? "1" : "0";
  }, [path]);

  return (
    <header className="site-header">
      <div className="site-header-inner relative mx-auto max-w-6xl">
        <div className="site-pill flex h-14 items-center justify-between gap-3 rounded-full px-3 pl-4" data-menu={menuOpen ? "open" : undefined}>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LogoMark src="/logo-icon.png" className="size-11 sm:size-10" />
            <span className="hidden whitespace-nowrap sm:inline lg:hidden xl:inline">{site.name}</span>
          </Link>
          <nav className="hidden items-center gap-x-5 whitespace-nowrap text-sm font-medium lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="link-fx" aria-current={isCurrent(path, n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/donate"
              className="whitespace-nowrap rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-95"
            >
              Donate now
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setOpenOn(menuOpen ? null : path)}
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
          <nav aria-label="Main menu" className="site-menu absolute top-full z-50 mt-2 grid rounded-3xl bg-white p-2 text-brand-dark shadow-xl lg:hidden">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isCurrent(path, n.href) ? "page" : undefined}
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
