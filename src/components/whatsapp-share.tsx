"use client";

import { Share2 } from "lucide-react";

// Opens WhatsApp with the event name and this page's link, ready to send.
export function WhatsAppShare({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${window.location.href}`)}`, "_blank", "noopener,noreferrer")}
      className="inline-flex items-center gap-2 rounded-full border-2 border-brand-dark/30 px-5 py-2.5 text-sm font-semibold hover:border-brand-dark"
    >
      <Share2 className="size-4" aria-hidden />
      Share on WhatsApp
    </button>
  );
}
