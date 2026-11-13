import Image from "next/image";

// The round society logo. The website uses the default picture; the admin panel passes its own.
export function LogoMark({ className = "size-9", src = "/logo.jpg" }: { className?: string; src?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}>
      <Image
        src={src}
        alt="Warrnambool Islamic Society logo"
        fill
        sizes="48px"
        className="scale-[1.04] object-cover"
      />
    </span>
  );
}
