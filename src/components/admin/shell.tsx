"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { Icon, type IconName } from "@/components/admin/icons";
import { IdleGuard } from "@/components/admin/idle-guard";
import { markSeen } from "@/lib/actions/seen";
import { NO_ALERTS, SECTIONS, sectionOfPath, type AlertCounts, type AlertSection } from "@/lib/alerts";
import { LogoMark } from "@/components/logo-mark";
import { ToastProvider, cx } from "@/components/admin/ui";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/posts", label: "News posts", icon: "posts" },
  { href: "/admin/events", label: "Events", icon: "events" },
  { href: "/admin/members", label: "Members", icon: "members" },
  { href: "/admin/donations", label: "Donations", icon: "donations" },
  { href: "/admin/messages", label: "Messages", icon: "messages" },
  { href: "/admin/subscribers", label: "Newsletter", icon: "newsletter" },
  { href: "/admin/team", label: "Team", icon: "team" },
  { href: "/admin/prayer", label: "Prayer times", icon: "prayer" },
  { href: "/admin/info", label: "Website info", icon: "info" },
  { href: "/admin/admins", label: "Admin users", icon: "admins" },
];

// Which guide page belongs to which admin page, so the round button opens the right one.
const GUIDE_PAGE: Record<string, string> = {
  "/admin": "overview",
  "/admin/posts": "posts",
  "/admin/events": "events",
  "/admin/members": "members",
  "/admin/donations": "donations",
  "/admin/messages": "messages",
  "/admin/subscribers": "newsletter",
  "/admin/team": "team",
  "/admin/prayer": "prayer",
  "/admin/info": "info",
  "/admin/admins": "admins",
};

function initials(email: string) {
  return email.split("@")[0].split(/[._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "A";
}

export function AdminShell({ email, alerts = NO_ALERTS, children }: { email: string; alerts?: AlertCounts; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)));
  const name = email.split("@")[0];
  const inGuide = pathname.startsWith("/admin/guide");
  const guideTopic = (current && GUIDE_PAGE[current.href]) || "start-here";

  // New alerts appear on their own: check again every minute while this tab is open and in view.
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [router]);

  // Being on a page with an alert is the same as having seen it: clear it (for this admin only).
  const here = sectionOfPath(pathname);
  const waitingHere = here ? alerts[here] : 0;
  useEffect(() => {
    if (here && waitingHere > 0) void markSeen(here);
  }, [here, waitingHere]);

  // Tighter on short screens so the whole menu, including Log out, fits without scrolling.
  const navItem = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition [@media(max-height:780px)]:py-1.5";

  return (
    <ToastProvider>
      <IdleGuard />
      <div className="grid min-h-dvh bg-background lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          aria-label="Menu"
          className={cx(
            "fixed inset-y-0 left-0 z-30 flex w-[272px] flex-col gap-1 overflow-y-auto bg-brand-dark px-3.5 py-5 text-white/80 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:w-auto lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center gap-3 px-2 pb-6 text-white [@media(max-height:780px)]:pb-3">
            <LogoMark className="size-10" src="/admin-logo.png" />
            <span className="text-base font-bold leading-tight">
              WIS Admin
              <small className="block text-[11.5px] font-normal text-white/60">Warrnambool Islamic Society</small>
            </span>
          </div>
          {NAV.map((n) => {
            const active = n === current;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cx(navItem, active ? "bg-white/15 text-white" : "hover:bg-white/10 hover:text-white")}
              >
                <Icon name={n.icon} className={active ? "text-accent" : undefined} />
                {n.label}
                {(() => {
                  const section = (Object.keys(SECTIONS) as AlertSection[]).find((s) => SECTIONS[s].href === n.href);
                  // No number on the page you are already looking at.
                  const count = section && !active ? alerts[section] : 0;
                  return (
                    count > 0 && (
                      <span
                        aria-label={`${count} new`}
                        className="ml-auto grid min-w-6 place-items-center rounded-full bg-accent px-1.5 text-xs font-bold leading-6 text-brand-dark tabular-nums"
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )
                  );
                })()}
              </Link>
            );
          })}
          <div className="mt-auto grid gap-1 border-t border-white/15 pt-3.5">
            <a href="/" target="_blank" rel="noopener noreferrer" className={cx(navItem, "hover:bg-white/10 hover:text-white")}>
              <Icon name="external" />
              View website
            </a>
            <Link href="/admin/set-password" className={cx(navItem, "hover:bg-white/10 hover:text-white")}>
              <Icon name="admins" />
              Change password
            </Link>
            <form action={signOut}>
              <button className={cx(navItem, "hover:bg-white/10 hover:text-white")}>
                <Icon name="out" />
                Log out
              </button>
            </form>
          </div>
        </aside>
        {open && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 pb-2 pt-5 sm:px-8">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-[#cfd1c7] bg-white lg:hidden"
            >
              <Icon name="menu" />
            </button>
            <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight sm:text-[28px]">{current?.label ?? (inGuide ? "Guide" : "Admin")}</h1>
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-brand-dark text-sm font-bold text-accent">{initials(email)}</span>
              <span className="hidden leading-tight sm:block">
                <b className="block text-sm">{name}</b>
                <small className="text-xs text-muted">Admin</small>
              </span>
            </div>
          </header>
          <div data-admin-content className="mx-auto grid w-full max-w-[1160px] flex-1 content-start gap-5 px-4 pb-24 pt-3 sm:px-8">{children}</div>
          <footer className="px-4 py-6 text-center text-[13px] text-muted">
            Powered by <b className="font-semibold text-foreground">3DiM Design Studio</b>
          </footer>
        </div>

        {!inGuide && (
          <Link
            href={`/admin/guide?topic=${guideTopic}`}
            aria-label="Open the guide"
            title="Guide: how to use this page"
            className="fixed bottom-4 left-4 z-10 grid size-12 place-items-center rounded-full bg-brand-dark text-xl font-bold text-accent shadow-lg ring-2 ring-white transition hover:scale-105 lg:left-[266px]"
          >
            ?
          </Link>
        )}
      </div>
    </ToastProvider>
  );
}
