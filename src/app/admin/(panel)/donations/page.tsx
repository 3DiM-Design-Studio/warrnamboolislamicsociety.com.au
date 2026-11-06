import type { Metadata } from "next";
import { DonationsForm } from "@/components/admin/donations-form";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { DonationRow } from "@/lib/types";

export const metadata: Metadata = { title: "Donations" };

export default async function DonationsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("donation_settings").select("intro,account_name,bsb,account_no,purposes").eq("id", 1).maybeSingle();
  if (error) return <LoadError error={error} />;
  const row: DonationRow = (data as DonationRow | null) ?? { intro: "", account_name: "", bsb: "", account_no: "", purposes: [] };
  return <DonationsForm donation={row} />;
}
