import { tooMany } from "@/lib/rate-limit";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (tooMany(req, "subscribe")) return Response.json({ error: "Too many tries. Please wait a few minutes and try again." }, { status: 429 });
  // Hidden "website" field: people never see it, spam bots fill it in. Pretend it worked and drop it.
  if (typeof body?.website === "string" && body.website.trim()) return Response.json({ ok: true });
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 200 || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!hasSupabase) return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });

  // The database function adds the address, or says it is already on the list. It also turns
  // someone who unsubscribed back on, because they have just asked to join again.
  const { data, error } = await createAnonClient().rpc("subscribe_email", { p_email: email });
  if (error || data === "invalid") {
    if (error) console.error("Could not save subscriber", error.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: error ? 500 : 400 });
  }
  return Response.json({ ok: true, already: data === "already" });
}
