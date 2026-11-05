import type { ReactNode } from "react";

const norm = (w: string) => w.toLowerCase().replace(/[^a-z-]/g, "");

// Big heading with an optional highlighted phrase and inline icons after chosen words.
export function RichHeading({
  text,
  icons = {},
  highlight,
}: {
  text: string;
  // Icons shown after matching words (lowercase, punctuation stripped).
  // Use "word#2" to target the second occurrence of a word.
  icons?: Record<string, ReactNode>;
  // A phrase in the text to mark with a highlighter background.
  highlight?: string;
}) {
  const words = text.split(" ");
  const counts = new Map<string, number>();
  const marked = new Set<number>();
  if (highlight) {
    const target = highlight.split(" ").map(norm);
    for (let i = 0; i + target.length <= words.length; i++) {
      if (target.every((t, j) => norm(words[i + j]) === t)) {
        target.forEach((_, j) => marked.add(i + j));
        break;
      }
    }
  }

  return (
    <h1 className="text-2xl font-bold leading-[1.2] tracking-tight sm:text-4xl lg:text-5xl">
      {words.map((w, i) => {
        // Keep trailing punctuation after the icon, e.g. "service [icon],"
        const [, word, trailing] = w.match(/^(.*?)([.,;:!?]*)$/)!;
        const key = norm(w);
        const n = (counts.get(key) ?? 0) + 1;
        counts.set(key, n);
        const icon = icons[`${key}#${n}`] ?? (n === 1 ? icons[key] : undefined);
        return (
          <span
            key={i}
            className={
              marked.has(i)
                ? "rounded-md bg-[#c9f26b] box-decoration-clone px-1"
                : ""
            }
          >
            {word}
            {icon && (
              <span className="mx-1.5 inline-flex translate-y-[0.1em] items-center align-baseline text-[#00bf2e]">
                {icon}
              </span>
            )}
            {trailing}{" "}
          </span>
        );
      })}
    </h1>
  );
}
