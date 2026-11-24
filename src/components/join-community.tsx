import { QrCode } from "@/components/qr-code";
import { WhatsAppIcon } from "@/components/social-links";
import { getSettings } from "@/lib/content";

/** A calm strip near the bottom of the Home page that invites people to the WhatsApp group. Hidden until the link is saved. */
export async function JoinCommunity() {
  const { whatsapp } = await getSettings();
  if (!whatsapp) return null;
  return (
    <section aria-labelledby="join-whatsapp" className="mt-16 rounded-3xl bg-card px-6 py-8 sm:px-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <div className="hidden shrink-0 text-center sm:block">
          <QrCode value={whatsapp} label="QR code to join the Warrnambool Muslims WhatsApp group" className="size-36 rounded-2xl border border-border" />
          <p className="mt-2 text-xs text-muted">Scan with your phone camera</p>
        </div>
        <div className="w-full text-center sm:text-left">
          <h2 id="join-whatsapp" className="text-2xl font-bold sm:text-3xl">
            Join our community on WhatsApp
          </h2>
          <p className="mt-2 max-w-md text-muted max-sm:mx-auto">Get news, event reminders and notices from Warrnambool Islamic Society in one place.</p>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full sm:w-auto">
            <WhatsAppIcon className="size-4" />
            Join the WhatsApp group
          </a>
        </div>
      </div>
    </section>
  );
}
