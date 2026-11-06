"use client";

import { useEffect, useState } from "react";

// "Jazakallahu khayran" cycling through languages; the last entry is where it lands and stays.
const phrases = [
  {
    text: "Jazakallahu khayran",
    font: "var(--font-libre-franklin)",
    dir: "ltr",
    lang: "en",
  },
  {
    text: "जज़ाकल्लाहु ख़ैरन",
    font: "var(--font-devanagari)",
    dir: "ltr",
    lang: "hi",
  },
  { text: "جزاک اللہ خیراً", font: "var(--font-urdu)", dir: "rtl", lang: "ur" },
  {
    text: "ஜசாகல்லாஹு கைரன்",
    font: "var(--font-tamil)",
    dir: "ltr",
    lang: "ta",
  },
  {
    text: "جزاك الله خيرًا",
    font: "var(--font-arabic)",
    dir: "rtl",
    lang: "ar",
  },
] as const;

const STEP_MS = 1100;

export function ThanksGreeting() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(phrases.length - 1);
      return;
    }
    const timers = phrases
      .slice(1)
      .map((_, i) => setTimeout(() => setIndex(i + 1), (i + 1) * STEP_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  const p = phrases[index];
  const landed = index === phrases.length - 1;

  return (
    <div className="mt-4 flex min-h-12 flex-wrap items-center gap-x-3">
      <p
        key={index}
        lang={p.lang}
        dir={p.dir}
        aria-label="Jazakallahu khayran"
        className={`text-2xl font-medium ${landed ? "animate-greet-in text-brand-gradient" : "animate-greet"}`}
        style={{ fontFamily: p.font }}
      >
        {p.text}
      </p>
      <span className="text-2xl font-medium">for joining the community</span>
    </div>
  );
}
