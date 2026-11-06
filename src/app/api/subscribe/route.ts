import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  await sendMail({
    to: process.env.MAIL_FROM!,
    subject: "New website update subscription",
    html: `<p>Please add <strong>${email.replace(/[<>&]/g, "")}</strong> to the community updates list.</p>`,
  });
  return Response.json({ ok: true });
}
