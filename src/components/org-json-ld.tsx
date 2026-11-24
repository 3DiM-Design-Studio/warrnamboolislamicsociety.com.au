import { JsonLd } from "@/components/json-ld";
import { site } from "@/content/site";
import { getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

/** The society's details for Google. Includes the Facebook page once its link is saved, which helps Google connect the two. */
export async function OrgJsonLd() {
  const s = await getSettings();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "NGO",
        name: site.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.jpg`,
        description: site.tagline,
        email: s.email || site.email,
        telephone: s.phones[0] || site.phones[0],
        areaServed: "Warrnambool, Victoria, Australia",
        ...(s.facebook ? { sameAs: [s.facebook] } : {}),
      }}
    />
  );
}
