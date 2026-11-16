import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/anon";

/**
 * Full-power client, for the few jobs a normal login cannot do: making an admin's login and a one-time
 * sign-in link. The key lives only on the server (Vercel). It is never sent to a browser, so keep it in
 * this one file's reach and never use it for anything a visitor can trigger without checks.
 * Returns null until SUPABASE_SERVICE_ROLE_KEY is set.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
