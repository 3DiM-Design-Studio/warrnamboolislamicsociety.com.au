"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};
const wantsMotion = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lenis smooth scrolling for the whole page (website and admin), skipped when the visitor prefers reduced motion.
export function SmoothScroll() {
  const on = useSyncExternalStore(noSubscribe, wantsMotion, () => false);
  return on ? <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true }} /> : null;
}
