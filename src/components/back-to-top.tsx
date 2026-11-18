"use client";

import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";

/** The round "back to top" button in the footer: glides to the top of the page (instantly if the visitor asked for less motion). */
export function BackToTop({ className = "" }: { className?: string }) {
  const lenis = useLenis();

  function goUp() {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) {
      window.scrollTo({ top: 0 });
    } else if (lenis) {
      // A long, soft glide: quick at the start, slowing as it reaches the top.
      lenis.scrollTo(0, { duration: Math.min(2.2, 0.9 + window.scrollY / 4000), easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={goUp}
      aria-label="Back to top"
      className={`group grid size-11 place-items-center rounded-full bg-brand-dark text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
    </button>
  );
}
