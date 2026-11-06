import { sendMail } from "@/lib/mail";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  await sendMail({
    to: process.env.MAIL_FROM!,
    subject: `Website enquiry from ${String(name).replace(/[\r\n]+/g, " ")}`,
    html: `<p>${esc(String(name))} &lt;${esc(String(email))}&gt;</p><p>${esc(String(message))}</p>`,
  });
  return Response.json({ ok: true });
}
