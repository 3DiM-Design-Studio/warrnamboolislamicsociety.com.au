import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { RichHeading } from "@/components/rich-heading";

export function PageHeading({
  title,
  highlight,
  icons,
  intro,
}: {
  title: string;
  highlight?: string;
  icons?: Record<string, ReactNode>;
  intro?: string;
}) {
  return (
    <>
      <div className="mt-8">
        <RichHeading text={title} highlight={highlight} icons={icons} />
      </div>
      {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
    </>
  );
}

// Standard page header: breadcrumb, big heading (optional highlight and icons), intro.
export function PageShell({
  title,
  crumb,
  parent,
  highlight,
  icons,
  intro,
  hideHeading,
  children,
}: {
  title: string;
  // Label for the current page in the breadcrumb (defaults to the title).
  crumb?: string;
  parent?: { label: string; href: string };
  highlight?: string;
  icons?: Record<string, ReactNode>;
  intro?: string;
  // For pages that place the heading themselves with PageHeading.
  hideHeading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href="/" className="link-fx inline-block py-2">
              Home
            </Link>
          </li>
          {parent && (
            <>
              <li aria-hidden>
                <ChevronRight className="size-4" />
              </li>
              <li>
                <Link href={parent.href} className="link-fx inline-block py-2">
                  {parent.label}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-brand-dark">
            {crumb ?? title}
          </li>
        </ol>
      </nav>

      {!hideHeading && (
        <PageHeading
          title={title}
          highlight={highlight}
          icons={icons}
          intro={intro}
        />
      )}
      <div className="mt-10 space-y-4 leading-relaxed">{children}</div>
    </div>
  );
}
