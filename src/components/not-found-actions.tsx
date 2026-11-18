"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ghost =
  "inline-flex items-center justify-center rounded-full border-2 border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white";

// The buttons depend on where the visitor was heading: committee members get the admin panel, everyone else the website.
export function NotFoundActions() {
  const path = usePathname() ?? "";
  const admin = path === "/admin" || path.startsWith("/admin/");
  return (
    <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
      {admin ? (
        <>
          <Link href="/admin" className="btn-primary">Back to the admin panel</Link>
          <Link href="/" className={ghost}>Go to the website</Link>
        </>
      ) : (
        <>
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/contact" className={ghost}>Contact us</Link>
        </>
      )}
    </div>
  );
}
