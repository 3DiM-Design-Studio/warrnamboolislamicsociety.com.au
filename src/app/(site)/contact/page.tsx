import { Heart, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";
import { getJumuah, getSettings } from "@/lib/content";

export const metadata = {
  title: "Contact Us",
  description: "Send a message to Warrnambool Islamic Society. We are happy to answer questions about prayer times, membership and events.",
};

export default async function Contact() {
  const [settings, jumuah] = await Promise.all([getSettings(), getJumuah()]);
  return (
    <PageShell
      title="We'd love to hear from you, so ask us anything."
      crumb="Contact"
      highlight="hear from you"
      icons={{
        love: <Heart className="size-[0.75em]" aria-hidden />,
        anything: <MessageCircle className="size-[0.75em]" aria-hidden />,
      }}
      intro="Use the form below and we will get back to you as soon as possible."
    >
      <ContactForm
        contact={{
          email: settings.email,
          phones: settings.phones,
          jumuah: jumuah.today ? `Every Friday at ${jumuah.today}` : "Every Friday",
          facebook: settings.facebook,
          whatsapp: settings.whatsapp,
        }}
      />
    </PageShell>
  );
}
