"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Sections below the fold rise in softly (a short fade and 14px lift) as they come into view.
// Anything already on screen is left alone, so nothing flashes or moves on first load.
// Visitors who ask for less motion get nothing, and without JavaScript everything simply shows.
export function ScrollReveal() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll<HTMLElement>("main section, [data-admin-content] > *");
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < vh) return;
      el.classList.add("reveal");
      io.observe(el);
    });
    // Safety net: after a jump (End key, anchor link) show anything the visitor has already passed.
    let t: number;
    const sweep = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        targets.forEach((el) => {
          if (el.classList.contains("reveal") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("reveal-in");
        });
      }, 400);
    };
    window.addEventListener("scroll", sweep, { passive: true });
    return () => {
      window.removeEventListener("scroll", sweep);
      window.clearTimeout(t);
      io.disconnect();
      targets.forEach((el) => el.classList.remove("reveal"));
    };
  }, [path]);
  return null;
}
