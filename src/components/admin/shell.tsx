"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { Icon, type IconName } from "@/components/admin/icons";
import { ToastProvider, cx } from "@/components/admin/ui";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/posts", label: "News posts", icon: "posts" },
  { href: "/admin/events", label: "Events", icon: "events" },
  { href: "/admin/members", label: "Members", icon: "members" },
  { href: "/admin/team", label: "Team", icon: "team" },
  { href: "/admin/prayer", label: "Prayer times", icon: "prayer" },
  { href: "/admin/jumuah", label: "Jumu’ah", icon: "jumuah" },
  { href: "/admin/info", label: "Website info", icon: "info" },
  { href: "/admin/admins", label: "Admin users", icon: "admins" },
];

function initials(email: string) {
  return email.split("@")[0].split(/[._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "A";
}

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)));
  const name = email.split("@")[0];

  const navItem = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition";

  return (
    <ToastProvider>
      <div className="grid min-h-screen bg-background lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          aria-label="Menu"
          className={cx(
            "fixed inset-y-0 left-0 z-30 flex w-[272px] flex-col gap-1 overflow-y-auto bg-brand-dark px-3.5 py-5 text-white/80 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center gap-3 px-2 pb-6 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-brand-gradient text-brand-dark">
              <Icon name="prayer" size={18} />
            </span>
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
              </Link>
            );
          })}
          <div className="mt-auto grid gap-1 border-t border-white/15 pt-3.5">
            <a href="/" target="_blank" rel="noopener noreferrer" className={cx(navItem, "hover:bg-white/10 hover:text-white")}>
              <Icon name="external" />
              View website
            </a>
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
              className="grid size-10 place-items-center rounded-full border border-[#cfd1c7] bg-white lg:hidden"
            >
              <Icon name="menu" />
            </button>
            <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight sm:text-[28px]">{current?.label ?? "Admin"}</h1>
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-brand-dark text-sm font-bold text-accent">{initials(email)}</span>
              <span className="hidden leading-tight sm:block">
                <b className="block text-sm">{name}</b>
                <small className="text-xs text-muted">Admin</small>
              </span>
            </div>
          </header>
          <div className="mx-auto grid w-full max-w-[1160px] flex-1 content-start gap-5 px-4 pb-6 pt-3 sm:px-8">{children}</div>
          <footer className="px-4 py-6 text-center text-[13px] text-muted">
            Powered by <b className="font-semibold text-foreground">3DiM Design Studio</b>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
