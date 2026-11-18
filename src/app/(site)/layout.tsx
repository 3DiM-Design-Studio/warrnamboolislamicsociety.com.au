import { Suspense } from "react";
import { Banner, Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Announcement } from "@/components/announcement";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/content/site";
import { SITE_URL } from "@/lib/site-url";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NGO",
          name: site.name,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.jpg`,
          description: site.tagline,
          email: site.email,
          telephone: site.phones[0],
          areaServed: "Warrnambool, Victoria, Australia",
        }}
      />
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
