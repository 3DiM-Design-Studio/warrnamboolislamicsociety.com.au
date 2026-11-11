import type { Metadata } from "next";
import { MembersManager } from "@/components/admin/members-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { MemberRow } from "@/lib/types";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("members").select("id,first_name,last_name,email,phone,address,suburb,postcode,spouse,children,amount_cents,status,submitted_date").order("submitted_date", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <MembersManager members={(data ?? []) as MemberRow[]} />;
}
