"use client";

import { useEffect, useState } from "react";

// The last entry is where the greeting lands and stays.
const greetings = [
  { text: "Assalamu Alaikum", font: "var(--font-libre-franklin)", dir: "ltr", lang: "en" },
  { text: "अस्सलामु अलैकुम", font: "var(--font-devanagari)", dir: "ltr", lang: "hi" },
  { text: "السلام علیکم", font: "var(--font-urdu)", dir: "rtl", lang: "ur" },
  { text: "அஸ்ஸலாமு அலைக்கும்", font: "var(--font-tamil)", dir: "ltr", lang: "ta" },
  { text: "السلام عليكم", font: "var(--font-arabic)", dir: "rtl", lang: "ar" },
] as const;

const STEP_MS = 1100;

export function HeroGreeting() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(greetings.length - 1);
      return;
    }
    const timers = greetings.slice(1).map((_, i) =>
      setTimeout(() => setIndex(i + 1), (i + 1) * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const g = greetings[index];
  const landed = index === greetings.length - 1;

  return (
    <div className="relative mb-3 flex h-14 items-center">
      <div className="splash-orb splash-orb-a !top-1/2 !left-0 !size-32 -translate-y-1/2 opacity-60" />
      <div className="splash-orb splash-orb-c !top-0 !left-16 !size-28 opacity-50" />
      <p
        key={index}
        lang={g.lang}
        dir={g.dir}
        aria-label="Assalamu Alaikum"
        className={`relative text-3xl font-medium sm:text-4xl ${landed ? "animate-greet-in text-brand-gradient" : "animate-greet"}`}
        style={{ fontFamily: g.font }}
      >
        {g.text}
      </p>
    </div>
  );
}
