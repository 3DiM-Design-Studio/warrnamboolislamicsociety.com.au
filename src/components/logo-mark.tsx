import Image from "next/image";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}>
      <Image
        src="/logo.jpg"
        alt="Warrnambool Islamic Society logo"
        fill
        sizes="48px"
        className="scale-[1.04] object-cover"
      />
    </span>
  );
}
