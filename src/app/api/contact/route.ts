import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  await sendMail({
    to: process.env.MAIL_FROM!,
    subject: `Website enquiry from ${name}`,
    html: `<p>${name} &lt;${email}&gt;</p><p>${message}</p>`,
  });
  return Response.json({ ok: true });
}
