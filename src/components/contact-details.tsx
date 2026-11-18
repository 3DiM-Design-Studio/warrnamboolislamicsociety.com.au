import { Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

// "+61 3 5907 1724" -> "+61359071724", so a tap on a phone starts the call.
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** The society's contact details with tap-to-call and tap-to-email links. Shown at the bottom of About and other pages (see ContactCta). */
export function ContactDetails({
  email,
  phones,
  jumuah,
  title = "Get in touch",
  text = "Questions about prayer times, membership or events? We would love to hear from you.",
  button = "Send us a message",
  compact = false,
}: {
  email: string;
  phones: string[];
  jumuah: string;
  title?: string;
  text?: string;
  button?: string;
  compact?: boolean;
}) {
  const label = "text-sm font-semibold text-muted";
  const link = "link-fx inline-block py-1 font-semibold text-brand-dark";
  return (
    <section className={compact ? "pt-12" : "pt-24"} aria-labelledby="contact-details">
      <div className={`rounded-3xl bg-brand-dark text-white ${compact ? "p-5 sm:p-8" : "p-6 sm:p-10"}`}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr] lg:items-center">
          <div>
            <h2 id="contact-details" className={`font-bold leading-tight tracking-tight ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"}`}>
              {title}
            </h2>
            <p className="mt-3 max-w-sm text-white/75">{text}</p>
            <Link href="/contact" className="btn-primary mt-6 w-full sm:w-auto">
              {button}
            </Link>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3 lg:gap-8">
            <div>
              <dt className={`flex items-center gap-2 ${label} text-white/60`}>
                <Mail className="size-4" aria-hidden /> Email
              </dt>
              <dd className="mt-2 break-words">
                <a href={`mailto:${email}`} className={`${link} text-white`}>
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className={`flex items-center gap-2 ${label} text-white/60`}>
                <Phone className="size-4" aria-hidden /> Phone
              </dt>
              <dd className="mt-2 grid">
                {phones.map((p) => (
                  <a key={p} href={telHref(p)} className={`${link} text-white`}>
                    {p}
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt className={`flex items-center gap-2 ${label} text-white/60`}>
                <Clock className="size-4" aria-hidden /> Jumu’ah
              </dt>
              <dd className="mt-2 font-semibold">{jumuah}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
