import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Page numbers to show: always the first, the last and the neighbours of the current page, with "…" for the gaps.
function numbers(page: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, page - 1, page, page + 1]);
  const out: (number | "gap")[] = [];
  let last = 0;
  for (let n = 1; n <= total; n++) {
    if (!keep.has(n)) continue;
    if (n - last > 1) out.push("gap");
    out.push(n);
    last = n;
  }
  return out;
}

const box = "grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-semibold";

// Previous / numbers / Next for a list. `hrefFor` gives the address of a page. Nothing is shown for a single page.
export function Pagination({ page, total, hrefFor }: { page: number; total: number; hrefFor: (n: number) => string }) {
  if (total <= 1) return null;
  const edge = (n: number, label: string, icon: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <span aria-disabled className={`${box} gap-1 text-muted/50`}>{icon}</span>
    ) : (
      <Link href={hrefFor(n)} aria-label={label} scroll className={`${box} gap-1 bg-card text-brand-dark hover:bg-white`}>
        {icon}
      </Link>
    );
  return (
    <nav aria-label="News pages" className="mt-8 flex items-center justify-center gap-2">
      {edge(page - 1, "Previous page", <ChevronLeft className="size-5" aria-hidden />, page <= 1)}
      <p className="px-2 text-sm text-muted sm:hidden">
        Page {page} of {total}
      </p>
      <ul className="hidden items-center gap-2 sm:flex">
        {numbers(page, total).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-muted">…</li>
          ) : (
            <li key={n}>
              <Link
                href={hrefFor(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={`${box} ${n === page ? "bg-brand-dark text-white" : "bg-card text-brand-dark hover:bg-white"}`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ul>
      {edge(page + 1, "Next page", <ChevronRight className="size-5" aria-hidden />, page >= total)}
    </nav>
  );
}
