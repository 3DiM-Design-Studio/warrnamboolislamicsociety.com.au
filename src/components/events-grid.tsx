"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { EventCard } from "@/components/story-cards";
import type { EventRow } from "@/lib/types";

const PER_PAGE = 9;

// 9 events per page, 3 across. The page buttons only appear when there is more than one page.
export function EventsGrid({ events }: { events: EventRow[] }) {
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, Math.ceil(events.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = events.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  function go(n: number) {
    setPage(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const btn = "grid size-10 place-items-center rounded-full border-2 border-brand-dark/30 font-semibold transition hover:border-brand-dark disabled:opacity-40 disabled:hover:border-brand-dark/30";

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label="Event pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => go(current - 1)} className={btn}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Page ${n}`}
              aria-current={n === current ? "page" : undefined}
              onClick={() => go(n)}
              className={`${btn} ${n === current ? "border-brand-dark! bg-brand-dark text-white" : ""}`}
            >
              {n}
            </button>
          ))}
          <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => go(current + 1)} className={btn}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}
