// The one email template for the whole website. Every email the site sends is built from these pieces, so
// they all look like they come from the same place: the website's own colours and fonts, the black
// Basmalah strip, the logo, and the same buttons and footer. To change how every email looks, change it here.
//
// Mail apps that load web fonts (Apple Mail, iPhone Mail, Outlook for Mac) use Libre Franklin and Tajawal.
// Gmail ignores them and falls back to Arial, so nothing depends on the fonts to look right.
import { SITE_URL } from "@/lib/site-url";

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const BRAND = {
  name: "Warrnambool Islamic Society",
  email: "warrnambool.is@gmail.com",
  phone: "+61 447 003 546",
  phoneLink: "+61447003546",
  website: SITE_URL,
  logo: `${SITE_URL}/logo.jpg`,
};

export const FONT = "'Libre Franklin',Arial,Helvetica,sans-serif";
export const ARABIC = "'Tajawal','Traditional Arabic','Arial Unicode MS',Arial,sans-serif";
const INK = "#121512";
const DARK = "#0b0d0b";
const MUTED = "#5f655e";
const LINE = "#e3e4dd";
const PAGE = "#f4f4f0";
const LINK = "#0f8a63";
const LIME_GRADIENT = "background:#c9f26b;background-image:linear-gradient(135deg,#c9f26b 0%,#00bf2e 100%)";

/** Wraps the content of any email: Basmalah strip, logo and name at the top, footer at the bottom. */
export function emailLayout(body: string, opts: { unsubscribeUrl?: string } = {}) {
  const unsub = opts.unsubscribeUrl
    ? `<br>You are getting this because you subscribed to ${BRAND.name} updates.<br><a href="${esc(opts.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=Tajawal:wght@500;700&display=swap" rel="stylesheet">
</head><body style="margin:0;padding:28px 12px;background:${PAGE};font-family:${FONT};color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${LINE};border-radius:24px;overflow:hidden">
  <tr><td align="center" style="background:${DARK};color:#ffffff;padding:12px 18px;font-size:13px;line-height:1.6">
    <div style="font-family:${ARABIC};font-size:18px">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
    <div style="opacity:.85">In the name of Allah, the Most Gracious, the Most Merciful</div>
  </td></tr>
  <tr><td style="padding:22px 28px 0">
    <img src="${BRAND.logo}" width="44" height="44" alt="" style="border-radius:50%;vertical-align:middle;margin-right:12px">
    <b style="font-size:16px;vertical-align:middle">${BRAND.name}</b>
  </td></tr>
  <tr><td style="padding:22px 28px 26px">
${body}
  </td></tr>
  <tr><td style="padding:16px 28px 22px;border-top:1px solid ${LINE};font-size:12px;color:${MUTED};line-height:1.8">
    ${BRAND.name} &middot; Registered with the ACNC${unsub}
  </td></tr>
</table></body></html>`;
}

/** A small label above a heading, for example "Reminder: Tomorrow". */
export const kicker = (text: string) =>
  `<div style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:${LINK}">${esc(text)}</div>`;

/** The big heading. */
export const heading = (text: string) => `<div style="margin:0 0 8px;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-0.02em">${esc(text)}</div>`;

/** A normal paragraph. Pass plain text; it is escaped here. */
export const paragraph = (text: string) => `<div style="margin:0 0 16px;color:${MUTED};font-size:15px;line-height:1.6">${esc(text)}</div>`;

/** The large Arabic line, left-aligned like the website's headings. */
export const arabicTitle = (text: string) => `<div dir="rtl" align="left" style="font-family:${ARABIC};font-size:46px;line-height:1.3;font-weight:700;color:${INK}">${text}</div>`;

/** The lime-to-green block, like the website's "Donate now" button, used to make one figure stand out. */
export const amountBar = (label: string, value: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px"><tr>
  <td style="padding:18px 20px;border-radius:18px;${LIME_GRADIENT};color:${DARK}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.12em">${esc(label)}</td>
      <td align="right" style="font-size:34px;font-weight:700;letter-spacing:-0.02em">${esc(value)}</td>
    </tr></table>
  </td></tr></table>`;

/** Label and value rows with thin lines between them. Values are escaped here. */
export function detailTable(rows: [string, string][]) {
  const cells = rows
    .map(([label, value], i) => {
      const line = i === rows.length - 1 ? "" : `border-bottom:1px solid ${LINE};`;
      return `<tr><td style="padding:12px 0;${line}color:${MUTED};width:42%;font-size:14.5px;vertical-align:top">${esc(label)}</td><td style="padding:12px 0;${line}font-weight:600;font-size:14.5px;vertical-align:top">${esc(value)}</td></tr>`;
    })
    .join("\n      ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px">
      ${cells}
    </table>`;
}

/** A quote in a soft box, for the hadith. */
export const quoteBox = (text: string, source: string) =>
  `<div style="margin-top:24px;padding:18px 20px;background:${PAGE};border:1px solid ${LINE};border-radius:18px">
      <div style="font-size:16px;line-height:1.6;font-weight:500">&ldquo;${esc(text)}&rdquo;</div>
      <div style="margin-top:8px;color:${MUTED};font-size:12.5px">${esc(source)}</div>
    </div>`;

/** A small grey note. */
export const note = (text: string) => `<p style="margin:18px 0 0;font-size:13.5px;line-height:1.6;color:${MUTED}">${text}</p>`;

/** The website's lime-to-green pill button. */
export const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="display:inline-block;${LIME_GRADIENT};color:${DARK};padding:12px 26px;border-radius:999px;font-weight:700;font-size:15px;text-decoration:none">${esc(label)}</a></p>`;

/** Email, phone and website, in the same three lines every time. */
export const contactBlock = () =>
  `<div style="margin-top:22px;padding-top:18px;border-top:1px solid ${LINE};font-size:14.5px;line-height:2">
      <span style="display:inline-block;width:74px;color:${MUTED}">Email</span> <a href="mailto:${BRAND.email}" style="color:${LINK};font-weight:600;text-decoration:none">${BRAND.email}</a><br>
      <span style="display:inline-block;width:74px;color:${MUTED}">Phone</span> <a href="tel:${BRAND.phoneLink}" style="color:${LINK};font-weight:600;text-decoration:none">${BRAND.phone}</a><br>
      <span style="display:inline-block;width:74px;color:${MUTED}">Website</span> <a href="${BRAND.website}/" style="color:${LINK};font-weight:600;text-decoration:none">${BRAND.website.replace(/^https?:\/\//, "")}</a>
    </div>`;
