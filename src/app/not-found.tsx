import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

// Any address that does not exist, on the website or under /admin.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-4 py-6">
      <NotFoundView />
    </main>
  );
}
