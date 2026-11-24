import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * A section title with a button to see everything. On a phone the button sits under the title, so the two never fight
 * for space; from tablet size up it is on the right of the title.
 */
export function SectionHeading({ title, href, label, id }: { title: string; href: string; label: string; id?: string }) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 id={id} className="text-balance text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-brand-dark/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand-dark"
      >
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  );
}
