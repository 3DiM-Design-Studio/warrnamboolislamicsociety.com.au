import Image from "next/image";
import Link from "next/link";

// ACNC badge. On hover the white container expands to the right to reveal what it is.
export function AcncBadge() {
  return (
    <Link
      href="/news/wis-registered-charity-acnc"
      aria-label="Registered charity with the ACNC. Read the announcement."
      className="group absolute bottom-0 left-6 z-10 translate-y-1/2 rounded-full p-[2px] hover:comet-border focus-visible:comet-border sm:left-10"
    >
      <span className="flex items-center overflow-hidden rounded-full bg-white">
        <span className="grid size-24 shrink-0 place-items-center sm:size-32">
          <Image
            src="/acnc-logo.png"
            alt="ACNC Registered Charity"
            width={960}
            height={816}
            className="size-[85%] object-contain"
          />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-normal opacity-0 transition-all duration-500 ease-out group-hover:max-w-[26rem] group-hover:opacity-100 group-focus-visible:max-w-[26rem] group-focus-visible:opacity-100">
          <span className="block w-64 pr-6 text-sm text-brand-dark sm:w-96">
            <span className="block font-bold">Registered charity with the ACNC</span>
            <span className="mt-1 line-clamp-2 text-muted">
              Warrnambool Islamic Society is registered with the Australian Charities and
              Not-for-profits Commission.
            </span>
            <span className="mt-2 block font-semibold text-[#0f8a63]">
              Read the announcement &rarr;
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
