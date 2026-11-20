import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { site } from "@/content/site";

export const legalLi = "list-disc space-y-1.5 pl-5";
export const legalLink = "font-semibold underline underline-offset-2";

export function LegalMail() {
  return (
    <a className={legalLink} href={`mailto:${site.email}`}>
      {site.email}
    </a>
  );
}

export type LegalSection = { id: string; title: string; body: ReactNode };

const policies = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/cookie-policy", label: "Cookie policy" },
  { href: "/gdpr", label: "Your data rights (GDPR)" },
  { href: "/terms", label: "Terms of use" },
];

// One layout for every policy page: a short contents list, numbered sections, links to the sibling policies and a contact box.
export function LegalPage({ title, intro, sections, current }: { title: string; intro: string; sections: LegalSection[]; current: string }) {
  return (
    <PageShell title={title} intro={intro}>
      <nav aria-label="On this page" className="max-w-3xl rounded-2xl bg-card p-5">
        <p className="mb-2 text-sm font-semibold">On this page</p>
        <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="link-fx inline-block py-1">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-3xl space-y-10 pt-4">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="mb-3 text-2xl font-bold">
              {i + 1}. {s.title}
            </h2>
            <div className="space-y-3 leading-relaxed">{s.body}</div>
          </section>
        ))}

        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-xl font-bold">Questions?</h2>
          <p className="mt-2">
            Email us at <LegalMail /> or use our{" "}
            <Link className={legalLink} href="/contact">
              contact page
            </Link>
            .
          </p>
          <p className="mt-4 text-sm font-semibold">Our other policies</p>
          <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {policies
              .filter((p) => p.href !== current)
              .map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="link-fx inline-block py-1">
                    {p.label}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
