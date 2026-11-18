"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// A sideways snap-scrolling row with previous / next buttons. On a phone it shows one card at a time with a "2 of 9" counter;
// from tablet size up it shows a row of cards with a fade on the right edge.
export function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 1, total: 1 });

  const step = () => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 16 : 480;
  };
  const scroll = (dir: 1 | -1) => {
    const phone = window.matchMedia("(max-width: 639px)").matches;
    ref.current?.scrollBy({ left: dir * (phone ? step() : 480), behavior: "smooth" });
  };

  // Keep the "2 of 9" counter in step with the scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const total = el.children.length;
      setPosition({ index: Math.min(total, Math.max(1, Math.round(el.scrollLeft / step()) + 1)), total });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const arrow = "grid size-11 place-items-center rounded-full border border-brand-dark/20 transition-colors hover:bg-brand-dark hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-inherit sm:size-10";

  return (
    <div>
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:[mask-image:linear-gradient(to_right,black_82%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous" disabled={position.index <= 1} className={arrow}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Next" disabled={position.index >= position.total} className={arrow}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <span className="ml-2 text-sm font-semibold tabular-nums text-muted sm:hidden" aria-live="polite">
          {position.index} of {position.total}
        </span>
      </div>
    </div>
  );
}
