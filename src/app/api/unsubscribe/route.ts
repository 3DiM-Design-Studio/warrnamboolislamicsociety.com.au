import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Called from the unsubscribe page. The token in each email's link is unique to that person.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!UUID.test(token) || !hasSupabase) {
    return Response.json({ error: "This link is not valid." }, { status: 400 });
  }
  const { data, error } = await createAnonClient().rpc("unsubscribe_by_token", { p_token: token });
  if (error) {
    console.error("Could not unsubscribe", error.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  if (!data) return Response.json({ error: "This link is not valid." }, { status: 404 });
  return Response.json({ ok: true });
}
