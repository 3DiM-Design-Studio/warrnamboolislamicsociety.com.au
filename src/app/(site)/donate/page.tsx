import {
  ArrowRight,
  ChevronRight,
  HandHeart,
  Landmark,
  Sprout,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DonateForm } from "@/components/donate-form";
import { RichHeading } from "@/components/rich-heading";
import { site } from "@/content/site";
import { getFaqs } from "@/lib/content";

export const metadata = {
  title: "Donate",
  description: "Give once or monthly to help build a permanent place of worship in Warrnambool. Secure card payment and an emailed receipt.",
};

const heading =
  "Your giving helps Warrnambool build a place of worship, strengthen our community and support generations to come.";
const icon = "size-[0.75em]";
const headingIcons = {
  giving: <HandHeart className={icon} aria-hidden />,
  worship: <Landmark className={icon} aria-hidden />,
  community: <Users className={icon} aria-hidden />,
  generations: <Sprout className={icon} aria-hidden />,
};

import { ContactCta } from "@/components/contact-cta";
export default async function Donate() {
  const faqs = await getFaqs("donate");
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="link-fx inline-block py-2">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-4" />
            </li>
            <li aria-current="page" className="font-medium text-brand-dark">
              Donate
            </li>
          </ol>
        </nav>
        <Link href="/" className="link-fx inline-block py-2 text-sm font-medium text-[#0f8a63]">
          Cancel
        </Link>
      </div>

      <div className="mt-8">
        <RichHeading
          text={heading}
          icons={headingIcons}
          highlight="place of worship"
        />
        <p className="mt-4 max-w-2xl text-sm text-muted">
          &ldquo;Those who spend their wealth in Allah&apos;s way by night and
          by day, secretly and publicly: they will have their reward with their
          Lord.&rdquo; (Surah Al-Baqarah 2:274)
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <div className="overflow-hidden rounded-2xl bg-[#eaf6e3]">
            <div className="relative h-44">
              <Image
                src="/hero.jpeg"
                alt="Mosque reflected in still water"
                fill
                sizes="288px"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-card p-5 text-sm">
            <Image
              src="/acnc-logo.png"
              alt="ACNC Registered Charity"
              width={960}
              height={816}
              className="h-16 w-auto shrink-0"
            />
            <p>
              Registered with the ACNC.{" "}
              <Link
                href="/news/wis-registered-charity-acnc"
                className="link-fx inline-flex items-center gap-1 font-semibold text-[#0f8a63]"
              >
                Read more <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </p>
          </div>
          {faqs.length > 0 && (
          <div className="divide-y divide-border rounded-2xl bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
                  {f.q}
                  <span className="text-lg transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          )}
        </aside>

        <section className="order-1 lg:order-2">
          <DonateForm />
          <div className="mt-6 space-y-2 px-1 text-xs text-muted">
            <p>
              Your gift supports a permanent place of worship and our community
              programs.
            </p>
            <p>
              Need help? Email{" "}
              <a
                className="link-fx font-semibold text-brand-dark"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
              .
            </p>
            <p>
              We respect your privacy. Read our{" "}
              <Link
                href="/privacy-policy"
                className="link-fx font-semibold text-brand-dark"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
      <ContactCta title="Prefer to donate another way?" text="Ask us about bank transfer, Zakat, a large gift or a regular donation, and we will guide you." button="Talk to us" />
    </div>
  );
}
