import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ACNC badge that overlaps the bottom edge of the hero picture. On phones it is a card that spans the picture with an even
// margin; from tablet size up it is the rounded pill on the left.
export function AcncBadge() {
  return (
    <Link
      href="/acnc"
      aria-label="Registered charity with the ACNC. See our certificate."
      className="group absolute inset-x-3 bottom-0 z-10 translate-y-1/2 sm:inset-x-auto sm:left-10 sm:max-w-[calc(100%-5rem)]"
    >
      <span className="flex items-center overflow-hidden rounded-3xl bg-white shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:rounded-full">
        <span className="grid size-[4.75rem] shrink-0 place-items-center sm:size-32">
          <Image src="/acnc-logo.png" alt="ACNC Registered Charity" width={960} height={816} className="size-[82%] object-contain" />
        </span>
        <span className="min-w-0 flex-1 py-3.5 pr-4 text-xs text-brand-dark sm:w-96 sm:flex-none sm:py-0 sm:pr-6 sm:text-sm">
          <span className="block font-bold">Registered charity with the ACNC</span>
          <span className="mt-0.5 line-clamp-2 text-muted sm:mt-1">
            Warrnambool Islamic Society is registered with the Australian Charities and Not-for-profits Commission.
          </span>
          <span className="link-fx mt-1.5 inline-flex items-center gap-1.5 font-semibold text-[#0f8a63] sm:mt-2">
            See our certificate
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </span>
      </span>
    </Link>
  );
}
