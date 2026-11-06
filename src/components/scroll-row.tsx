"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

// Horizontal snap-scrolling row with a fade on the right edge and prev/next buttons.
export function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <div>
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,black_82%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className="grid size-10 place-items-center rounded-full border border-brand-dark/20 hover:bg-brand-dark hover:text-white"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Next"
          className="grid size-10 place-items-center rounded-full border border-brand-dark/20 hover:bg-brand-dark hover:text-white"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
