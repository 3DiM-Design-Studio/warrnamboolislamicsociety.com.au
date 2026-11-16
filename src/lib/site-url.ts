// The public address of the website. Links inside emails must always use this, never the address
// the admin happened to be on (which can be localhost). When the real domain goes live, set SITE_URL
// in Vercel to it (for example https://www.warrnamboolislamicsociety.com.au).
export const SITE_URL = (process.env.SITE_URL ?? "https://warrnamboolislamicsociety-com-au.vercel.app").replace(/\/+$/, "");
