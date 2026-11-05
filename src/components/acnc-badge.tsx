import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ACNC badge, always expanded: logo on the left, what it is and a link to the announcement on the right.
export function AcncBadge() {
  return (
    <Link
      href="/news/wis-registered-charity-acnc"
      aria-label="Registered charity with the ACNC. Read the announcement."
      className="group absolute bottom-0 left-6 z-10 max-w-[calc(100%-3rem)] translate-y-1/2 rounded-full sm:left-10"
    >
      <span className="flex items-center overflow-hidden rounded-full bg-white">
        <span className="grid size-20 shrink-0 place-items-center sm:size-32">
          <Image
            src="/acnc-logo.png"
            alt="ACNC Registered Charity"
            width={960}
            height={816}
            className="size-[85%] object-contain"
          />
        </span>
        <span className="min-w-0">
          <span className="block w-52 pr-5 text-xs text-brand-dark sm:w-96 sm:pr-6 sm:text-sm">
            <span className="block font-bold">
              Registered charity with the ACNC
            </span>
            <span className="mt-1 line-clamp-2 text-muted">
              Warrnambool Islamic Society is registered with the Australian
              Charities and Not-for-profits Commission.
            </span>
            <span className="link-fx mt-2 inline-flex items-center gap-1.5 font-semibold text-[#0f8a63]">
              Read the announcement
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
