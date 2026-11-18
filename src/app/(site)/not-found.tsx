import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

// A news story or event that no longer exists: shown inside the normal header and footer.
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-13rem)] items-center px-4 py-8 sm:min-h-[calc(100dvh-9.5rem)] sm:py-12">
      <NotFoundView />
    </div>
  );
}
