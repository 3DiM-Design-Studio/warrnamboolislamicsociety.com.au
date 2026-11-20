import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContactCta } from "@/components/contact-cta";
import { PageShell } from "@/components/page-shell";
import { charity, site } from "@/content/site";

export const metadata = {
  title: "ACNC Registration",
  description: `${site.name} is a registered charity with the Australian Charities and Not-for-profits Commission (ACNC). See our certificate and ABN.`,
};

export default function Acnc() {
  const row = "grid gap-0.5 border-b border-border py-3 sm:grid-cols-[11rem_1fr] sm:gap-4";
  return (
    <PageShell title="ACNC Registration">
      <p>
        Warrnambool Islamic Society (WIS) is now officially registered as a charity with
        the ACNC, Alhamdulillah. This marks a major step forward for our community.
      </p>
      <p>
        We are awaiting the final decision on our planning permit. The goal is clear: build
        a dedicated place of worship for our growing community. Your support will help
        establish a permanent place of worship, strengthen the local Muslim community and
        create a space for future generations.
      </p>
      <p>
        Read the full{" "}
        <Link href="/news/wis-registered-charity-acnc" className="text-brand link-fx">
          announcement
        </Link>
        .
      </p>

      <section aria-labelledby="registration" className="grid gap-8 pt-8 md:grid-cols-[1fr_20rem] md:items-start">
        <div>
          <h2 id="registration" className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="size-6 text-brand" aria-hidden />
            Our registration
          </h2>
          <dl className="mt-4 border-t border-border">
            <div className={row}>
              <dt className="text-sm font-semibold text-muted">Registered name</dt>
              <dd className="font-semibold">{charity.legalName}</dd>
            </div>
            <div className={row}>
              <dt className="text-sm font-semibold text-muted">Known as</dt>
              <dd className="font-semibold">{site.name} (WIS)</dd>
            </div>
            <div className={row}>
              <dt className="text-sm font-semibold text-muted">ABN</dt>
              <dd className="font-semibold">{charity.abn}</dd>
            </div>
            <div className={row}>
              <dt className="text-sm font-semibold text-muted">Registered on</dt>
              <dd className="font-semibold">{charity.registered}</dd>
            </div>
            <div className={row}>
              <dt className="text-sm font-semibold text-muted">Registered with</dt>
              <dd className="font-semibold">Australian Charities and Not-for-profits Commission (ACNC)</dd>
            </div>
          </dl>
          <p className="mt-4 text-muted">You do not have to take our word for it. Anyone can check our status on the official ACNC Charity Register.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={charity.registerUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ExternalLink className="size-4" aria-hidden />
              Check us on the ACNC Register
            </a>
            <a href="/acnc-certificate.pdf" download="WIS-ACNC-Registration-Certificate.pdf" className="btn-secondary">
              <Download className="size-4" aria-hidden />
              Download certificate (PDF)
            </a>
          </div>
          <p className="mt-3 text-sm text-muted">On the register, search for our ABN {charity.abn}.</p>
        </div>

        <a href="/acnc-certificate.pdf" target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-border bg-white p-2 shadow-sm" aria-label="Open the ACNC registration certificate (PDF)">
          <Image src="/acnc-certificate.jpg" alt="ACNC registration certificate for Warrnambool Islamic Community Centre Ltd, ABN 94 687 715 395, registered 4 June 2025" width={1000} height={1414} className="h-auto w-full rounded-xl" />
        </a>
      </section>

      <ContactCta title="Want to speak with someone?" text="We are glad to answer questions about our registration, our plans and how your support is used." button="Contact us" />
    </PageShell>
  );
}
