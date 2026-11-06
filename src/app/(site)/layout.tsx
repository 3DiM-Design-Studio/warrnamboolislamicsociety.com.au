import { Suspense } from "react";
import { Banner, Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Announcement } from "@/components/announcement";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Announcement />
      <Banner />
      {/* The header reads the current address, which is unknown for pages like /news/[slug] until a visitor arrives. */}
      <Suspense fallback={<div aria-hidden className="h-[88px]" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
