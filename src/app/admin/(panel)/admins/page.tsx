import type { Metadata } from "next";
import { AdminsManager } from "@/components/admin/admins-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { AdminRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminsPage() {
  const { supabase, email } = await requireAdmin();
  const { data, error } = await supabase.from("admins").select("email,created_at").order("created_at", { ascending: true });
  if (error) return <LoadError error={error} />;
  return <AdminsManager admins={(data ?? []) as AdminRow[]} me={email} />;
}
