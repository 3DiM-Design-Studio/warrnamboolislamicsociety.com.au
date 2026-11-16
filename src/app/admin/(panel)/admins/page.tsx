import type { Metadata } from "next";
import { AdminsManager } from "@/components/admin/admins-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { AdminRequestRow, AdminRow } from "@/lib/types";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminsPage() {
  const { supabase, email } = await requireAdmin();
  const [admins, requests] = await Promise.all([
    supabase.from("admins").select("email,created_at").order("created_at", { ascending: true }),
    // Left out of the error check: before the requests table exists this just shows no requests.
    supabase.from("admin_requests").select("id,email,name,created_at").order("created_at", { ascending: true }),
  ]);
  if (admins.error) return <LoadError error={admins.error} />;
  return <AdminsManager admins={(admins.data ?? []) as AdminRow[]} requests={requests.error ? [] : ((requests.data ?? []) as AdminRequestRow[])} me={email} />;
}
