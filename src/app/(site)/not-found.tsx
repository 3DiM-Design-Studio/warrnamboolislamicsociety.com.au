import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

// A news story or event that no longer exists: shown inside the normal header and footer.
export default function NotFound() {
  return (
    <div className="px-4">
      <NotFoundView />
    </div>
  );
}
