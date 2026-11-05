import Image from "next/image";

// Small wide image pill shown inline in big headings.
export function CoastPill() {
  return (
    <span className="relative inline-block h-[0.8em] w-[1.9em] overflow-hidden rounded-full">
      <Image
        src="/warrnambool-coast.jpg"
        alt=""
        fill
        sizes="160px"
        className="object-cover object-[50%_52%]"
      />
    </span>
  );
}
