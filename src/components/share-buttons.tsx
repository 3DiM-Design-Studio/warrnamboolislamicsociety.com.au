"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

const pill = "inline-flex items-center gap-2 rounded-full border-2 border-brand-dark/30 px-4 py-2 text-sm font-semibold transition-colors hover:border-brand-dark";

// Share this page: WhatsApp, Facebook, or copy the link. Used on news stories and event pages.
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers: select a temporary field and copy from it.
      const box = document.createElement("textarea");
      box.value = url;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      try {
        document.execCommand("copy");
      } catch {}
      box.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this page">
      <button type="button" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${window.location.href}`)}`)} className={pill}>
        <Share2 className="size-4" aria-hidden />
        WhatsApp
      </button>
      <button type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} className={pill}>
        <Share2 className="size-4" aria-hidden />
        Facebook
      </button>
      <button type="button" onClick={copy} className={pill} aria-live="polite">
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
