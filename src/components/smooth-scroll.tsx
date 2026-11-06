"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

// Lenis smooth scrolling for the whole page, skipped when the visitor prefers reduced motion.
export function SmoothScroll() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return on ? <ReactLenis root options={{ lerp: 0.1 }} /> : null;
}
