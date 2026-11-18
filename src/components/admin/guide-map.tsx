import type { CSSProperties, ReactNode } from "react";

// Simple drawings of the admin screens with numbered red boxes.
// Everything is sized in "cqw" (1% of the picture's width), so the drawing shrinks neatly on a phone.

const cq = (n: number) => `${n}cqw`;
const box = (x: number, y: number, w: number, h: number): CSSProperties => ({ position: "absolute", left: cq(x), top: cq(y), width: cq(w), height: cq(h) });

function Frame({ ratio, label, children }: { ratio: number; label: string; children: ReactNode }) {
  return (
    <figure className="my-4 overflow-hidden rounded-2xl border border-border bg-white">
      <div role="img" aria-label={label} className="relative w-full select-none" style={{ containerType: "inline-size", aspectRatio: `100 / ${ratio}` }}>
        {children}
      </div>
    </figure>
  );
}

/** A red box with a number in its top left corner. */
function Mark({ n, x, y, w, h }: { n: number; x: number; y: number; w: number; h: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none z-10 rounded-[0.8cqw] border-2 border-dashed border-[#d92d20]" style={box(x, y, w, h)}>
      <span
        className="absolute grid place-items-center rounded-full bg-[#d92d20] font-bold leading-none text-white"
        style={{ left: "max(-1.6cqw, -11px)", top: "max(-1.6cqw, -11px)", width: "max(3.2cqw, 20px)", height: "max(3.2cqw, 20px)", fontSize: "max(1.8cqw, 11px)" }}
      >
        {n}
      </span>
    </span>
  );
}

const text = (size: number, extra?: CSSProperties): CSSProperties => ({ fontSize: cq(size), lineHeight: 1.2, ...extra });

function Card({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
  return (
    <div className="overflow-hidden border border-border bg-white" style={{ ...box(x, y, w, h), borderRadius: cq(1.2), padding: cq(1.2) }}>
      {children}
    </div>
  );
}

const NAV = ["Overview", "News posts", "Events", "Members", "Donations", "Messages", "Newsletter", "Team", "Prayer times", "Website info", "Admin users"];

function Dashboard() {
  return (
    <Frame ratio={62} label="A drawing of the admin Overview page with numbered red boxes">
      <div className="absolute inset-0 bg-background">
        {/* menu */}
        <div className="absolute inset-y-0 left-0 bg-brand-dark text-white/80" style={{ width: cq(19) }}>
          <div className="flex items-center" style={{ gap: cq(1), padding: `${cq(1.6)} ${cq(1.5)}` }}>
            <span className="rounded-full bg-white/80" style={{ width: cq(3.2), height: cq(3.2) }} />
            <span className="font-bold text-white" style={text(1.5)}>WIS Admin</span>
          </div>
          <div style={{ position: "absolute", left: cq(1), top: cq(8), width: cq(17) }}>
            {NAV.map((n, i) => (
              <div key={n} className={i === 0 ? "rounded-md bg-white/15 font-semibold text-white" : ""} style={{ ...text(1.4), height: cq(3.5), padding: `${cq(0.95)} ${cq(1.2)}` }}>
                {n}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: cq(1), top: cq(49), width: cq(17), borderTop: "1px solid rgba(255,255,255,.2)" }}>
            {["View website", "Log out"].map((n) => (
              <div key={n} style={{ ...text(1.4), height: cq(3.5), padding: `${cq(0.95)} ${cq(1.2)}` }}>
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* top bar */}
        <div className="absolute font-bold" style={{ ...text(2.5), left: cq(21.5), top: cq(2.2) }}>
          Overview
        </div>
        <div className="absolute flex items-center" style={{ right: cq(1.5), top: cq(1.4), gap: cq(1) }}>
          <span className="grid place-items-center rounded-full bg-brand-dark font-bold text-accent" style={{ ...text(1.3), width: cq(3.6), height: cq(3.6) }}>AB</span>
          <span style={text(1.3)}>
            <b className="block">admin</b>
            <span className="text-muted">Admin</span>
          </span>
        </div>

        {/* number cards */}
        {["Next prayer", "Jumu’ah", "News posts", "Members"].map((l, i) => (
          <Card key={l} x={21.5 + i * 19.6} y={11} w={18.2} h={11}>
            <div className="text-muted" style={text(1.3)}>{l}</div>
            <div className="font-bold" style={{ ...text(2.4), marginTop: cq(1.2) }}>{["Asr 3:45", "12:30", "8", "126"][i]}</div>
          </Card>
        ))}

        {/* prayer times */}
        <Card x={21.5} y={25} w={38.3} h={28}>
          <div className="font-bold" style={text(1.6)}>Today’s prayer times</div>
          {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => (
            <div key={p} className="flex justify-between border-t border-border" style={{ ...text(1.3), padding: `${cq(1)} 0` }}>
              <span>{p}</span>
              <span className="text-muted">Azan · Iqamah</span>
            </div>
          ))}
        </Card>
        <Card x={61.2} y={25} w={37.3} h={16.5}>
          <div className="font-bold" style={text(1.6)}>Quick actions</div>
          <div className="grid grid-cols-2" style={{ gap: cq(1), marginTop: cq(1.2) }}>
            {["Write a post", "Add an event", "See members", "Read messages"].map((q) => (
              <div key={q} className="rounded-md border border-border bg-background" style={{ ...text(1.25), padding: cq(1.1) }}>
                {q}
              </div>
            ))}
          </div>
        </Card>
        <Card x={61.2} y={43.2} w={37.3} h={9.8}>
          <div className="font-bold" style={text(1.6)}>To do</div>
          <div className="text-muted" style={{ ...text(1.3), marginTop: cq(1) }}>Nothing to do. All good.</div>
        </Card>

        {/* the round guide button */}
        <span className="absolute grid place-items-center rounded-full bg-brand-dark font-bold text-accent shadow" style={{ ...text(2.2), left: cq(21), top: cq(55.5), width: cq(4.6), height: cq(4.6) }}>
          ?
        </span>

        <Mark n={1} x={1} y={7.5} w={17} h={43} />
        <Mark n={2} x={21} y={1.4} w={14} h={5.4} />
        <Mark n={3} x={88.4} y={0.8} w={10.6} h={5.4} />
        <Mark n={4} x={21} y={10.4} w={77.6} h={12.6} />
        <Mark n={5} x={21} y={24.4} w={38.8} h={29} />
        <Mark n={6} x={60.7} y={24.4} w={38} h={17.2} />
        <Mark n={7} x={60.7} y={42.6} w={38} h={11} />
        <Mark n={8} x={1} y={52} w={17} h={8.8} />
        <Mark n={9} x={20.4} y={54.9} w={5.8} h={5.8} />
      </div>
    </Frame>
  );
}

function List() {
  return (
    <Frame ratio={47} label="A drawing of a typical list page with numbered red boxes">
      <div className="absolute inset-0 bg-background">
        <Card x={3} y={3} w={94} h={41}>
          <div className="flex items-center justify-between">
            <span className="font-bold" style={text(1.9)}>All posts</span>
            <span className="rounded-full bg-accent font-semibold text-brand-dark" style={{ ...text(1.4), padding: `${cq(0.9)} ${cq(2)}` }}>+ New post</span>
          </div>
          <div className="flex" style={{ gap: cq(1.2), marginTop: cq(1.8) }}>
            <span className="rounded-full border border-border bg-background text-muted" style={{ ...text(1.4), padding: `${cq(1)} ${cq(2)}`, width: cq(30) }}>Search posts</span>
            <span className="rounded-full border border-border bg-background" style={{ ...text(1.4), padding: `${cq(1)} ${cq(2)}` }}>All posts</span>
            <span className="rounded-full border border-border bg-background" style={{ ...text(1.4), padding: `${cq(1)} ${cq(2)}` }}>Sort: Newest</span>
          </div>
          {[
            ["Eid prayer times", "On website"],
            ["Thank you volunteers", "Draft"],
            ["Winter working bee", "On website"],
          ].map(([t, b], i) => (
            <div key={t} className="flex items-center justify-between border-t border-border" style={{ marginTop: i === 0 ? cq(2.2) : 0, padding: `${cq(1.5)} 0` }}>
              <span className="flex items-center" style={{ gap: cq(1.2), ...text(1.5) }}>
                <b>{t}</b>
                <span className={"rounded-full font-semibold " + (b === "Draft" ? "bg-[#ecece5] text-muted" : "bg-[#dcf1e8] text-[#0f6a4d]")} style={{ ...text(1.1), padding: `${cq(0.4)} ${cq(1.2)}` }}>
                  {b}
                </span>
              </span>
              <span className="flex" style={{ gap: cq(1), ...text(1.3) }}>
                <span className="rounded-full border border-border bg-white" style={{ padding: `${cq(0.8)} ${cq(1.8)}` }}>Edit</span>
                <span className="rounded-full border border-border bg-white text-[#b3261e]" style={{ padding: `${cq(0.8)} ${cq(1.8)}` }}>Delete</span>
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border" style={{ ...text(1.3), padding: `${cq(1.4)} 0` }}>
            <span className="text-muted">Showing 1–10 of 24</span>
            <span className="flex items-center" style={{ gap: cq(1) }}>
              <span className="rounded-full border border-border bg-white opacity-50" style={{ padding: `${cq(0.8)} ${cq(1.8)}` }}>Previous</span>
              Page 1 of 3
              <span className="rounded-full border border-border bg-white" style={{ padding: `${cq(0.8)} ${cq(1.8)}` }}>Next</span>
            </span>
          </div>
        </Card>

        <Mark n={1} x={4} y={9} w={31} h={5} />
        <Mark n={2} x={35.2} y={9} w={24.6} h={5} />
        <Mark n={3} x={83.5} y={3.6} w={12.5} h={5} />
        <Mark n={4} x={4} y={16} w={29} h={19.5} />
        <Mark n={5} x={80} y={16} w={16.5} h={19.5} />
        <Mark n={6} x={70} y={36.2} w={26.5} h={5} />
      </div>
    </Frame>
  );
}

export function GuideMap({ id }: { id: "dashboard" | "list" }) {
  return id === "dashboard" ? <Dashboard /> : <List />;
}
