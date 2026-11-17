import { mailConfigured, sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/site-url";

export type ReceiptDetails = {
  to: string;
  name: string;
  amountCents: number;
  date: string; // YYYY-MM-DD, Melbourne day
  monthly: boolean;
  receiptNo: string;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const WEBSITE = SITE_URL;
const EMAIL = "warrnambool.is@gmail.com";
const PHONE = "+61 447 003 546";
const PHONE_LINK = "+61447003546";
const HADITH = "Whoever spends a pair of something in the way of Allah will be called from the gates of Paradise.";
const HADITH_SOURCE = "Sahih al-Bukhari 2841, Sahih Muslim 1027";

const money = (cents: number) => `A$${(cents / 100).toFixed(2)}`;
const longDate = (d: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));

/** The thank-you receipt, in the approved dark design. Plain text is included for mail apps that do not show HTML. */
export function receiptEmail(r: ReceiptDetails) {
  const first = r.name.trim().split(/\s+/)[0] || "friend";
  const type = r.monthly ? "Monthly gift" : "One-time gift";
  const amount = money(r.amountCents);
  const logo = `${WEBSITE}/logo.jpg`;

  const html = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#0c0d0f;font-family:Arial,Helvetica,sans-serif;color:#f3f0e6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#15171a;border:1px solid #2a2d32;border-radius:18px;overflow:hidden">
  <tr><td style="padding:14px 22px;border-bottom:1px solid #2a2d32;font-size:13.5px">
    <img src="${logo}" width="40" height="40" alt="" style="border-radius:50%;vertical-align:middle;margin-right:10px">
    <b style="color:#f3f0e6">Warrnambool Islamic Society</b><br><span style="color:#9ea29a">${EMAIL} &middot; to ${esc(first)}</span>
  </td></tr>
  <tr><td align="center" style="padding:40px 28px 34px;background:#1c1f23;border-bottom:2px solid #d6b26a">
    <img src="${logo}" width="84" height="84" alt="Warrnambool Islamic Society logo" style="border-radius:50%;background:#ffffff;padding:4px">
    <div style="font-family:'Traditional Arabic',Amiri,'Arial Unicode MS',Georgia,serif;font-size:50px;line-height:1.5;color:#d6b26a;margin-top:18px;direction:rtl">جزاك الله خيرًا</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#f3f0e6;margin:6px 0 8px">Jazakallah Khair for your donation</div>
    <div style="color:#9ea29a;font-size:14.5px">Dear ${esc(first)}, your gift to the society has been received.</div>
  </td></tr>
  <tr><td style="padding:30px">
    <div style="text-align:center;padding-bottom:24px;margin-bottom:22px;border-bottom:1px solid #2a2d32">
      <div style="color:#9ea29a;font-size:11px;text-transform:uppercase;letter-spacing:.18em">Amount received</div>
      <div style="margin-top:6px;font-family:Georgia,serif;font-size:40px;color:#d6b26a">${amount}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
      <tr><td style="padding:11px 0;border-bottom:1px solid #2a2d32;color:#9ea29a;width:42%">Receipt number</td><td style="padding:11px 0;border-bottom:1px solid #2a2d32">${esc(r.receiptNo)}</td></tr>
      <tr><td style="padding:11px 0;border-bottom:1px solid #2a2d32;color:#9ea29a">Date</td><td style="padding:11px 0;border-bottom:1px solid #2a2d32">${esc(longDate(r.date))}</td></tr>
      <tr><td style="padding:11px 0;border-bottom:1px solid #2a2d32;color:#9ea29a">Donation type</td><td style="padding:11px 0;border-bottom:1px solid #2a2d32">${type}</td></tr>
      <tr><td style="padding:11px 0;border-bottom:1px solid #2a2d32;color:#9ea29a">Given to</td><td style="padding:11px 0;border-bottom:1px solid #2a2d32">Warrnambool Islamic Society</td></tr>
      <tr><td style="padding:11px 0;color:#9ea29a">Name on receipt</td><td style="padding:11px 0">${esc(r.name)}</td></tr>
    </table>
    <div style="margin-top:28px;padding:22px 24px;background:#1c1f23;border:1px solid #2a2d32;border-radius:12px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;font-style:italic;color:#f3f0e6">&ldquo;${HADITH}&rdquo;</div>
      <div style="margin-top:12px;color:#9ea29a;font-size:12px;letter-spacing:.04em">${HADITH_SOURCE}</div>
    </div>
    <p style="margin:22px 0 0;font-size:13px;color:#9ea29a;text-align:center">Keep this email for your records. If you need a tax receipt, reply to this email or contact the committee.</p>
    <div style="margin-top:26px;padding:20px 22px;background:#1c1f23;border-radius:12px;font-size:14px;line-height:2;color:#9ea29a">
      <b style="display:inline-block;width:80px;font-weight:normal">Email</b> <a href="mailto:${EMAIL}" style="color:#d6b26a;text-decoration:none">${EMAIL}</a><br>
      <b style="display:inline-block;width:80px;font-weight:normal">Phone</b> <a href="tel:${PHONE_LINK}" style="color:#d6b26a;text-decoration:none">${PHONE}</a><br>
      <b style="display:inline-block;width:80px;font-weight:normal">Website</b> <a href="${WEBSITE}/" style="color:#d6b26a;text-decoration:none">${WEBSITE.replace(/^https?:\/\//, "")}</a>
    </div>
  </td></tr>
  <tr><td align="center" style="padding:18px 26px 24px;border-top:1px solid #2a2d32;font-size:12px;color:#9ea29a;line-height:1.8">
    Warrnambool Islamic Society &middot; Registered with the ACNC<br>
    <a href="${WEBSITE}/unsubscribe" style="color:#9ea29a">Stop receiving updates</a>
  </td></tr>
</table></body></html>`;

  const text = [
    "Jazakallah Khair for your donation",
    "",
    `Dear ${first}, your gift to the society has been received.`,
    "",
    `Amount received: ${amount}`,
    `Receipt number: ${r.receiptNo}`,
    `Date: ${longDate(r.date)}`,
    `Donation type: ${type}`,
    `Given to: Warrnambool Islamic Society`,
    `Name on receipt: ${r.name}`,
    "",
    `"${HADITH}"`,
    HADITH_SOURCE,
    "",
    `Email: ${EMAIL}`,
    `Phone: ${PHONE}`,
    `Website: ${WEBSITE}`,
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
      replyTo: EMAIL,
    });
    return true;
  } catch (e) {
    console.error("Donation receipt email failed", e);
    return false;
  }
}
