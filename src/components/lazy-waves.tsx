"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import GradientWaves from "@/components/GradientWaves";

/**
 * The animated waves in the footer. The 3D drawing is only started once the footer is close to the screen, so it never
 * slows down the first load or the scrolling of the page above it.
 */
export function LazyWaves(props: ComponentProps<typeof GradientWaves>) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          watch.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return (
    <div ref={box} className="size-full">
      {near && <GradientWaves {...props} />}
    </div>
  );
}
