import type { Metadata } from "next";
import { DonationsManager } from "@/components/admin/donations-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { DonationRow } from "@/lib/types";

export const metadata: Metadata = { title: "Donations" };

export default async function DonationsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("donations")
    .select("id,donor_name,email,phone,amount_cents,frequency,anonymous,wants_receipt,dedication,submitted_date")
    .order("submitted_date", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <DonationsManager donations={(data ?? []) as DonationRow[]} month={melbourneToday().slice(0, 7)} />;
}
