import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
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
