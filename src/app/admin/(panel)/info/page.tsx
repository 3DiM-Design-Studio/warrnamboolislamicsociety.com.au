import type { Metadata } from "next";
import { FaqsManager } from "@/components/admin/faqs-manager";
import { InfoForm } from "@/components/admin/info-form";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { FaqRow, SettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Website info" };

export default async function InfoPage() {
  const { supabase } = await requireAdmin();
  const [settings, faqs] = await Promise.all([
    supabase.from("site_settings").select("phones,email,facebook,banner_on,banner_text").eq("id", 1).maybeSingle(),
    supabase.from("faqs").select("id,page,question,answer,sort_order").order("sort_order", { ascending: true }),
  ]);
  if (settings.error) return <LoadError error={settings.error} />;
  const row: SettingsRow = (settings.data as SettingsRow | null) ?? { phones: [], email: "", facebook: "", banner_on: false, banner_text: "" };
  return (
    <>
      <InfoForm settings={row} />
      {/* If the FAQ table is not set up yet, the contact details above still work. */}
      {faqs.error ? <LoadError error={faqs.error} /> : <FaqsManager faqs={(faqs.data ?? []) as FaqRow[]} />}
    </>
  );
}
