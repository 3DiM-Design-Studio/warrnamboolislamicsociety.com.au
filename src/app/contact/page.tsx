import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/content/site";

export const metadata = { title: "Contact Us" };

export default function Contact() {
  return (
    <PageShell
      title="Contact Us"
      intro="Use the form below and we will get back to you as soon as possible."
    >
      <p>
        You can also call {site.phones.join(", ")} or email{" "}
        <a className="text-brand underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
      <ContactForm />
    </PageShell>
  );
}
