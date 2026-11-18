import Link from "next/link";
import type { ReactNode } from "react";

const STARS: [number, number, number, number][] = [
  [52, 40, 1.6, 0], [110, 88, 1.2, 1.1], [170, 28, 1.4, 0.6], [236, 70, 1.1, 1.7], [300, 24, 1.5, 0.3],
  [352, 84, 1.2, 1.4], [28, 124, 1.3, 0.9], [452, 120, 1.5, 0.5], [270, 120, 1, 1.9], [140, 130, 1, 0.2],
];

// A glowing check mark between two swinging lanterns and a crescent moon. Pure SVG + CSS (see .ty-* and .nf-* in globals.css).
function Scene() {
  return (
    <svg viewBox="0 0 480 220" role="img" aria-label="A green check mark glowing between two lanterns under a crescent moon" className="mx-auto h-auto w-full max-w-sm">
      <defs>
        <mask id="ty-moon">
          <rect width="480" height="220" fill="#fff" />
          <circle cx="346" cy="40" r="20" fill="#000" />
        </mask>
        <radialGradient id="ty-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#c9f26b" stopOpacity="0.6" />
          <stop offset="1" stopColor="#c9f26b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ty-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9f26b" />
          <stop offset="1" stopColor="#00bf2e" />
        </linearGradient>
      </defs>

      {STARS.map(([x, y, r, d], i) => (
        <circle key={i} className="nf-star" cx={x} cy={y} r={r} fill="#fff" style={{ animationDelay: `${d}s` }} />
      ))}

      <g className="nf-float">
        <circle cx="350" cy="42" r="40" fill="url(#ty-glow)" />
        <circle cx="350" cy="42" r="26" fill="#c9f26b" mask="url(#ty-moon)" />
      </g>

      {/* the check mark */}
      <g className="ty-pop">
        <circle cx="240" cy="116" r="78" fill="url(#ty-glow)" />
        <circle cx="240" cy="116" r="44" fill="url(#ty-badge)" />
        <path className="ty-check" d="M219 117l15 15 29-32" fill="none" stroke="#0b0d0b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* lanterns */}
      {[
        { x: 78, delay: "0s" },
        { x: 402, delay: "-2s" },
      ].map((l) => (
        <g key={l.x} className="nf-swing" style={{ transformOrigin: `${l.x}px 0px`, transformBox: "view-box", animationDelay: l.delay }}>
          <path d={`M${l.x} 0v40`} stroke="#4a584a" strokeWidth="2" />
          <circle cx={l.x} cy="74" r="26" fill="url(#ty-glow)" />
          <path d={`M${l.x - 10} 42h20l4 8h-28z`} fill="#3a463a" />
          <path d={`M${l.x - 14} 50h28l-4 36h-20z`} fill="#c9f26b" fillOpacity="0.9" />
          <path d={`M${l.x - 14} 50h28l-4 36h-20z`} fill="none" stroke="#3a463a" strokeWidth="2" />
          <path d={`M${l.x - 7} 86h14l-3 8h-8z`} fill="#3a463a" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The "thank you" page used after a donation, a membership payment and a message to the committee.
 * It always offers two ways on: back to the page the person came from, and back to the home page.
 */
export function ThankYouView({
  title,
  message,
  back,
  children,
}: {
  title: string;
  message: ReactNode;
  /** Where "go back" leads, for example { href: "/donate", label: "Back to Donate" }. */
  back: { href: string; label: string };
  /** Anything extra (a picture to download, a line of advice) shown between the message and the buttons. */
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate mx-auto my-8 w-full max-w-3xl overflow-hidden rounded-3xl bg-brand-dark px-6 py-10 text-center text-white sm:my-12 sm:px-10 sm:py-14">
      <Scene />
      <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <div className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/80 sm:text-base">{message}</div>
      {children && <div className="mt-6">{children}</div>}
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Link href={back.href} className="btn-primary">
          {back.label}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
