import { Suspense } from "react";
import { Banner, Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Announcement } from "@/components/announcement";
import { OrgJsonLd } from "@/components/org-json-ld";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Suspense fallback={null}>
        <OrgJsonLd />
      </Suspense>
      <Announcement />
      <Banner />
      {/* The header reads the current address, which is unknown for pages like /news/[slug] until a visitor arrives. */}
      <Suspense fallback={<div aria-hidden className="site-header-space" />}>
        <Header />
      </Suspense>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
    </>
  );
}
