import Link from "next/link";
import { Suspense } from "react";
import { NotFoundActions } from "@/components/not-found-actions";

const STARS: [number, number, number, number][] = [
  [46, 38, 1.6, 0], [92, 84, 1.2, 1.1], [150, 30, 1.4, 0.6], [214, 66, 1.1, 1.7], [292, 26, 1.5, 0.3],
  [338, 78, 1.2, 1.4], [30, 130, 1.3, 0.9], [440, 130, 1.5, 0.5], [262, 110, 1, 1.9], [124, 128, 1, 0.2],
];

// A night-time mosque skyline with a crescent moon and a swinging lantern. Pure SVG + CSS, so it is tiny and
// needs no extra library. The movement is in globals.css (.nf-*) and stops for visitors who prefer less motion.
function Scene() {
  return (
    <svg
      viewBox="0 0 480 260"
      role="img"
      aria-label="A mosque at night under a crescent moon, with a lantern swinging"
      className="mx-auto h-auto w-full max-w-md"
    >
      <defs>
        <mask id="nf-moon">
          <rect width="480" height="260" fill="#fff" />
          <circle cx="338" cy="46" r="24" fill="#000" />
        </mask>
        <radialGradient id="nf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#c9f26b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c9f26b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nf-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f281f" />
          <stop offset="1" stopColor="#121712" />
        </linearGradient>
      </defs>

      {STARS.map(([x, y, r, d], i) => (
        <circle key={i} className="nf-star" cx={x} cy={y} r={r} fill="#fff" style={{ animationDelay: `${d}s` }} />
      ))}

      <g className="nf-float">
        <circle cx="328" cy="52" r="46" fill="url(#nf-glow)" />
        <circle cx="328" cy="52" r="30" fill="#c9f26b" mask="url(#nf-moon)" />
      </g>

      <g fill="url(#nf-ground)">
        <path d="M168 214a72 72 0 0 1 144 0z" />
        <rect x="160" y="212" width="160" height="48" />
        <path d="M92 226a34 34 0 0 1 68-12v12z" />
        <path d="M320 214a34 34 0 0 1 68 12v-12z" />
        <rect x="60" y="226" width="360" height="34" />
        <rect x="64" y="108" width="18" height="120" />
        <path d="M60 108l13-30 13 30z" />
        <rect x="398" y="108" width="18" height="120" />
        <path d="M394 108l13-30 13 30z" />
      </g>
      <g stroke="#2f3b2f" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M240 142v-26" />
        <path d="M73 78V62M407 78V62" />
      </g>
      <circle cx="240" cy="112" r="4" fill="#c9f26b" />
      <circle cx="73" cy="58" r="3" fill="#c9f26b" />
      <circle cx="407" cy="58" r="3" fill="#c9f26b" />

      <g fill="#c9f26b">
        <path className="nf-window" d="M230 250v-22a10 10 0 0 1 20 0v22z" />
        <path className="nf-window" style={{ animationDelay: "1.2s" }} d="M190 250v-16a7 7 0 0 1 14 0v16z" />
        <path className="nf-window" style={{ animationDelay: "0.6s" }} d="M276 250v-16a7 7 0 0 1 14 0v16z" />
        <rect className="nf-window" style={{ animationDelay: "1.8s" }} x="69" y="150" width="8" height="14" rx="4" />
        <rect className="nf-window" x="403" y="150" width="8" height="14" rx="4" />
      </g>

      <g className="nf-swing" style={{ transformOrigin: "128px 0px", transformBox: "view-box" }}>
        <path d="M128 0v34" stroke="#4a584a" strokeWidth="2" />
        <circle cx="128" cy="62" r="26" fill="url(#nf-glow)" />
        <path d="M118 36h20l4 8h-28z" fill="#3a463a" />
        <path d="M114 44h28l-4 36h-20z" fill="#c9f26b" fillOpacity="0.9" />
        <path d="M114 44h28l-4 36h-20z" fill="none" stroke="#3a463a" strokeWidth="2" />
        <path d="M121 80h14l-3 8h-8z" fill="#3a463a" />
      </g>
    </svg>
  );
}

// The 404 card, used by every missing page: the website (inside its header and footer) and the admin panel.
export function NotFoundView() {
  return (
    <section className="relative isolate mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-brand-dark px-6 py-10 text-center text-white sm:px-10 sm:py-14">
      <Scene />
      <p className="mt-5 text-6xl font-bold leading-none tracking-tight text-brand-gradient sm:text-7xl" aria-hidden>
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">This page has gone missing</h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-base">
        The page you are looking for does not exist, or it has been moved. Check the address for typing mistakes, or use one of the buttons below.
      </p>
      <Suspense
        fallback={
          <div className="mt-7 flex justify-center">
            <Link href="/" className="btn-primary">Back to home</Link>
          </div>
        }
      >
        <NotFoundActions />
      </Suspense>
    </section>
  );
}
