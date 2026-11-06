import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/anon";

/** Browser client, used only for uploading photos with the admin's own login. */
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
