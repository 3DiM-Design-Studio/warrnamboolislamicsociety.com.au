import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { nav, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-6xl px-4 pb-6">
      <div className="rounded-3xl bg-brand-dark p-8 text-sm text-white/70 sm:p-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-white">
              <LogoMark className="size-9" />
              {site.name}
            </p>
            <p className="mt-3">A registered charity with the ACNC.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Explore</p>
            <p className="mt-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}>{n.label}</Link>
              ))}
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <p className="mt-3">{site.email}</p>
            {site.phones.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="mt-3 flex gap-4">
              <Link href="/acnc">ACNC</Link>
              <Link href="/privacy-policy">Privacy</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
