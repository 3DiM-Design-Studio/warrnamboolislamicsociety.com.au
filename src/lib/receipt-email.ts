import { arabicTitle, amountBar, BRAND, contactBlock, detailTable, emailLayout, heading, note, paragraph, quoteBox } from "@/lib/email-template";
import { mailConfigured, sendMail } from "@/lib/mail";

export type ReceiptDetails = {
  to: string;
  name: string;
  amountCents: number;
  date: string; // YYYY-MM-DD, Melbourne day
  monthly: boolean;
  receiptNo: string;
};

const HADITH = "Whoever spends a pair of something in the way of Allah will be called from the gates of Paradise.";
const HADITH_SOURCE = "Sahih al-Bukhari 2841, Sahih Muslim 1027";

/** The receipt number printed on the email. The same payment always gives the same number. */
export function receiptNumber(paymentIntent?: string | null, invoice?: string | null) {
  return "WIS-" + (paymentIntent ?? invoice ?? "").replace(/^(pi_|in_)/, "").slice(-8).toUpperCase();
}

const money = (cents: number) => `A$${(cents / 100).toFixed(2)}`;
const longDate = (d: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));

/** The thank-you receipt, built from the website's shared email template. Plain text is included for mail apps that do not show HTML. */
export function receiptEmail(r: ReceiptDetails) {
  const first = r.name.trim().split(/\s+/)[0] || "friend";
  const type = r.monthly ? "Monthly gift" : "One-time gift";
  const amount = money(r.amountCents);

  const html = emailLayout(
    [
      arabicTitle("جزاك الله خيرًا"),
      heading("Jazakallah Khair for your donation"),
      paragraph(`Dear ${first}, your gift to the society has been received.`),
      amountBar("Amount received", amount),
      detailTable([
        ["Receipt number", r.receiptNo],
        ["Date", longDate(r.date)],
        ["Donation type", type],
        ["Given to", BRAND.name],
        ["Name on receipt", r.name],
      ]),
      quoteBox(HADITH, HADITH_SOURCE),
      note("Keep this email for your records. If you need a tax receipt, reply to this email or contact the committee."),
      contactBlock(),
    ].join("\n"),
  );

  const text = [
    "Jazakallah Khair for your donation",
    "",
    `Dear ${first}, your gift to the society has been received.`,
    "",
    `Amount received: ${amount}`,
    `Receipt number: ${r.receiptNo}`,
    `Date: ${longDate(r.date)}`,
    `Donation type: ${type}`,
    `Given to: ${BRAND.name}`,
    `Name on receipt: ${r.name}`,
    "",
    `"${HADITH}"`,
    HADITH_SOURCE,
    "",
    `Email: ${BRAND.email}`,
    `Phone: ${BRAND.phone}`,
    `Website: ${BRAND.website}`,
  ].join("\n");

  return { html, text };
}

/** Sends the thank-you receipt. Never throws: an email problem must not undo a saved donation. */
export async function sendDonationReceipt(r: ReceiptDetails): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    const { html, text } = receiptEmail(r);
    await sendMail({
      to: r.to,
      subject: `Thank you for your donation, ${r.name.split(/\s+/)[0] || "friend"}`,
      html,
      text,
      replyTo: BRAND.email,
    });
    return true;
  } catch (e) {
    console.error("Donation receipt email failed", e);
    return false;
  }
}
