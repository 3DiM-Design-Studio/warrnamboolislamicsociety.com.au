import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";
import { getSettings } from "@/lib/content";

export const metadata = { title: "Contact Us" };

export default async function Contact() {
  const s = await getSettings();
  return (
    <PageShell
      title="Contact Us"
      intro="Use the form below and we will get back to you as soon as possible."
    >
      <p>
        You can also call {s.phones.join(", ")} or email{" "}
        <a className="text-brand underline" href={`mailto:${s.email}`}>
          {s.email}
        </a>
        .
      </p>
      <ContactForm />
    </PageShell>
  );
}
