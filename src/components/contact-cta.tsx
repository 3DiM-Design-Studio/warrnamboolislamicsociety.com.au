import { Suspense } from "react";
import { ContactDetails } from "@/components/contact-details";
import { Skeleton } from "@/components/skeletons";
import { getJumuah, getSettings } from "@/lib/content";

type Words = { title: string; text: string; button?: string; compact?: boolean };

async function Details(words: Words) {
  const [settings, jumuah] = await Promise.all([getSettings(), getJumuah()]);
  return <ContactDetails email={settings.email} phones={settings.phones} jumuah={jumuah.today ? `Every Friday at ${jumuah.today}` : "Every Friday"} {...words} />;
}

/** The dark "Get in touch" card, with the details taken from the admin settings. Put it at the end of a page. */
export function ContactCta(words: Words) {
  return (
    <Suspense
      fallback={
        <div aria-hidden className={words.compact ? "pt-12" : "pt-24"}>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      }
    >
      <Details {...words} />
    </Suspense>
  );
}
