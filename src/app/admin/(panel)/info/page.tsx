import type { Metadata } from "next";
import { InfoForm } from "@/components/admin/info-form";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { SettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Website info" };

export default async function InfoPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("phones,email,facebook,banner_on,banner_text").eq("id", 1).maybeSingle();
  if (error) return <LoadError error={error} />;
  const row: SettingsRow = (data as SettingsRow | null) ?? { phones: [], email: "", facebook: "", banner_on: false, banner_text: "" };
  return <InfoForm settings={row} />;
}
