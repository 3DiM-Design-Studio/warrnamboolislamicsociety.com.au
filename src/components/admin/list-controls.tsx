"use client";

import { Button, cx, inputClass } from "@/components/admin/ui";

export const PAGE_SIZE = 10;

/**
 * Small controls for the top of a list. On a phone every control fills its cell and they sit two to a row;
 * from tablet size up they are narrow and share a line.
 */
export const filterClass = cx(inputClass, "w-full! min-w-0 py-2! text-base font-semibold sm:w-auto! sm:text-sm");

/**
 * The row that holds the search box and the filters. On a phone it is a neat grid: the search box, the Sort drop-down and
 * "Clear filters" take a whole row each, and the other filters sit two to a row (a single one takes the full width).
 */
export const filterBar = "grid grid-cols-2 gap-2.5 max-sm:[&>select:last-of-type]:col-span-2 max-sm:[&>select:nth-last-of-type(2):nth-of-type(odd)]:col-span-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3";

/** True when every word typed appears somewhere in the text. Capital letters do not matter. */
export function matchesSearch(query: string, ...parts: (string | null | undefined)[]) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = parts.join(" ").toLowerCase();
  return words.every((w) => text.includes(w));
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cx(inputClass, "col-span-2 w-full py-2! text-base sm:col-span-1 sm:w-64 sm:text-sm")}
    />
  );
}

/** Cuts a list into pages. Asking for a page past the end gives the last one. */
export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(page, 1), pages);
  const first = (current - 1) * size;
  const rows = items.slice(first, first + size);
  return { rows, current, pages, first, count: rows.length, total: items.length };
}

export function Pager({ current, pages, first, count, total, onPage }: { current: number; pages: number; first: number; count: number; total: number; onPage: (page: number) => void }) {
  if (total === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>
        Showing {first + 1}&ndash;{first + count} of {total}
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button small disabled={current === 1} onClick={() => onPage(current - 1)}>
            Previous
          </Button>
          <span className="px-1 font-semibold tabular-nums text-brand-dark">
            Page {current} of {pages}
          </span>
          <Button small disabled={current === pages} onClick={() => onPage(current + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
