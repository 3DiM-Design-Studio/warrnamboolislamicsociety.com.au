import type { Metadata } from "next";
import { MessagesManager } from "@/components/admin/messages-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { ContactRow } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contacts")
    .select("id,name,email,message,status,submitted_date")
    .order("submitted_date", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <MessagesManager messages={(data ?? []) as ContactRow[]} />;
}
