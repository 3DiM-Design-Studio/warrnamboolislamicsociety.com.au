"use client";

import { useMemo, useState, type ReactNode } from "react";
import { GuideMap } from "@/components/admin/guide-map";
import { Cards, ConfirmMock, Flow, FormMock } from "@/components/admin/guide-visuals";
import { Icon } from "@/components/admin/icons";
import { ALL_TOPICS, GUIDE, type Block, type Topic } from "@/lib/guide-content";
import { Card, cx } from "@/components/admin/ui";

const blockText = (b: Block): string => {
  switch (b.t) {
    case "p":
    case "tip":
    case "warn":
      return b.text;
    case "steps":
    case "list":
    case "legend":
    case "flow":
      return b.items.join(" ");
    case "cards":
      return b.items.map((c) => `${c.title} ${c.text}`).join(" ");
    case "form":
      return `${b.title} ${b.open} ${b.fields.map((f) => f.label).join(" ")}`;
    case "confirm":
      return b.text;
    default:
      return "";
  }
};

type Hit = { topic: Topic; part: number; heading: string; snippet: string };

function search(query: string): Hit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const hits: { hit: Hit; score: number }[] = [];
  for (const topic of ALL_TOPICS) {
    topic.parts.forEach((part, i) => {
      const body = part.blocks.map(blockText).filter(Boolean);
      const hay = `${topic.title} ${topic.summary} ${part.heading} ${body.join(" ")}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return;
      const line = body.find((t) => words.some((w) => t.toLowerCase().includes(w))) ?? body[0] ?? topic.summary;
      const snippet = line.length > 170 ? `${line.slice(0, 167)}...` : line;
      const score = (topic.title.toLowerCase().includes(words[0]) ? 2 : 0) + (part.heading.toLowerCase().includes(words[0]) ? 2 : 0);
      hits.push({ hit: { topic, part: i, heading: part.heading, snippet }, score });
    });
  }
  return hits.sort((a, b) => b.score - a.score).map((h) => h.hit);
}

function Num({ n }: { n: number }) {
  return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#d92d20] text-xs font-bold text-white">{n}</span>;
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="grid gap-3">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i} className="text-[15px] leading-relaxed">
                {b.text}
              </p>
            );
          case "steps":
            return (
              <ol key={i} className="grid gap-2.5">
                {b.items.map((s, j) => (
                  <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-dark text-xs font-bold text-accent">{j + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            );
          case "list":
            return (
              <ul key={i} className="grid gap-2">
                {b.items.map((s, j) => (
                  <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-dark" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            );
          case "legend":
            return (
              <ol key={i} className="grid gap-2.5 rounded-2xl bg-background p-4">
                {b.items.map((s, j) => (
                  <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed">
                    <Num n={j + 1} />
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            );
          case "tip":
            return (
              <p key={i} className="rounded-xl bg-[#dcf1e8] px-4 py-3 text-[14.5px] leading-relaxed text-[#0f4f3a]">
                <b>Tip: </b>
                {b.text}
              </p>
            );
          case "warn":
            return (
              <p key={i} className="rounded-xl bg-[#f6edd6] px-4 py-3 text-[14.5px] leading-relaxed text-[#6b4d0c]">
                <b>Careful: </b>
                {b.text}
              </p>
            );
          case "map":
            return <GuideMap key={i} id={b.id} />;
          case "flow":
            return <Flow key={i} items={b.items} />;
          case "cards":
            return <Cards key={i} items={b.items} />;
          case "form":
            return <FormMock key={i} title={b.title} open={b.open} fields={b.fields} button={b.button} />;
          case "confirm":
            return <ConfirmMock key={i} text={b.text} />;
        }
      })}
    </div>
  );
}

export function GuideBook({ initialTopic }: { initialTopic: string }) {
  const [slug, setSlug] = useState(initialTopic);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  // Only the section you are reading starts open, so the menu stays short and never needs scrolling.
  const groupOf = (s: string) => GUIDE.find((g) => g.topics.some((t) => t.slug === s))?.title;
  const [openGroups, setOpenGroups] = useState<string[]>(() => [groupOf(initialTopic) ?? GUIDE[0].title]);
  const topic = ALL_TOPICS.find((t) => t.slug === slug) ?? ALL_TOPICS[0];
  const index = ALL_TOPICS.indexOf(topic);
  const prev = ALL_TOPICS[index - 1];
  const next = ALL_TOPICS[index + 1];
  const hits = useMemo(() => search(query), [query]);
  const searching = query.trim().length > 0;

  function open(s: string, part?: number) {
    setSlug(s);
    const g = groupOf(s);
    if (g) setOpenGroups((o) => (o.includes(g) ? o : [...o, g]));
    setQuery("");
    setMenuOpen(false);
    window.history.replaceState(null, "", `?topic=${s}`);
    // Wait for the new page to draw, then go to the top of it or to the chosen heading.
    requestAnimationFrame(() => {
      if (part == null) window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(`${s}-${part}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const toc: ReactNode = (
    <nav aria-label="Guide contents" className="grid gap-1">
      {GUIDE.map((g) => {
        const expanded = openGroups.includes(g.title);
        return (
          <div key={g.title}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpenGroups((o) => (expanded ? o.filter((x) => x !== g.title) : [...o, g.title]))}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-bold uppercase tracking-wide text-muted transition hover:bg-[#ecece5]"
            >
              {g.title}
              <Icon name={expanded ? "up" : "down"} size={16} />
            </button>
            {expanded && (
              <ul className="mt-0.5 grid gap-0.5">
                {g.topics.map((t) => {
                  const active = t.slug === topic.slug && !searching;
                  return (
                    <li key={t.slug}>
                      <button
                        type="button"
                        onClick={() => open(t.slug)}
                        aria-current={active ? "page" : undefined}
                        className={cx("w-full rounded-xl px-3 py-2 text-left text-[14.5px] font-medium transition", active ? "bg-brand-dark text-white" : "hover:bg-[#ecece5]")}
                      >
                        {t.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      {/* Contents: always visible on a big screen, a drop-down on a phone */}
      <div className="lg:sticky lg:top-20">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left text-[15px] font-semibold lg:hidden"
        >
          <span>
            Contents <span className="font-normal text-muted">· {topic.title}</span>
          </span>
          <Icon name={menuOpen ? "up" : "down"} size={18} />
        </button>
        <div className={cx("mt-2 overscroll-contain rounded-2xl border border-border bg-card p-3 lg:mt-0 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto", menuOpen ? "block max-h-[60dvh] overflow-y-auto" : "hidden")}>{toc}</div>
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="relative">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the guide, for example: reminder"
            aria-label="Search the guide"
            className="w-full rounded-full border border-[#cfd1c7] bg-white py-3 pl-11 pr-4 text-[15px] outline-none transition focus:border-brand-dark"
          />
        </div>

        {searching ? (
          <Card>
            <h2 className="mb-1 text-lg font-bold">{hits.length === 0 ? "Nothing found" : `${hits.length} ${hits.length === 1 ? "result" : "results"}`}</h2>
            {hits.length === 0 ? (
              <p className="text-sm text-muted">Try a shorter or simpler word, for example “event” or “email”.</p>
            ) : (
              <ul className="grid">
                {hits.map((h) => (
                  <li key={`${h.topic.slug}-${h.part}`} className="border-t border-border first:border-0">
                    <button type="button" onClick={() => open(h.topic.slug, h.part)} className="w-full rounded-xl px-2 py-3 text-left transition hover:bg-background">
                      <span className="block text-xs font-semibold text-muted">{h.topic.title}</span>
                      <span className="block text-[15px] font-bold">{h.heading}</span>
                      <span className="mt-0.5 block text-sm text-muted">{h.snippet}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : (
          <Card className="p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{GUIDE.find((g) => g.topics.includes(topic))?.title}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">{topic.title}</h2>
            <p className="mt-2 text-[15px] text-muted">{topic.summary}</p>
            {topic.parts.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {topic.parts.map((p, i) => (
                  <button key={p.heading} type="button" onClick={() => open(topic.slug, i)} className="rounded-full border border-[#cfd1c7] bg-white px-3 py-1.5 text-[13px] font-semibold transition hover:border-brand-dark">
                    {p.heading}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-7 grid gap-9">
              {topic.parts.map((p, i) => (
                <section key={p.heading} id={`${topic.slug}-${i}`} className="scroll-mt-24">
                  <h3 className="mb-3 text-lg font-bold">{p.heading}</h3>
                  <Blocks blocks={p.blocks} />
                </section>
              ))}
            </div>
            <div className="mt-10 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              {prev ? (
                <button type="button" onClick={() => open(prev.slug)} className="rounded-2xl border border-border px-4 py-3 text-left transition hover:border-brand-dark">
                  <span className="block text-xs text-muted">Before</span>
                  <span className="font-semibold">&larr; {prev.title}</span>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button type="button" onClick={() => open(next.slug)} className="rounded-2xl border border-border px-4 py-3 text-left transition hover:border-brand-dark sm:text-right">
                  <span className="block text-xs text-muted">Next</span>
                  <span className="font-semibold">{next.title} &rarr;</span>
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
