import type { Metadata } from "next";
import { SubscribersManager } from "@/components/admin/subscribers-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import type { SubscriberRow } from "@/lib/types";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("subscribers")
    .select("id,email,status,subscribed_date")
    .order("subscribed_date", { ascending: false });
  if (error) return <LoadError error={error} />;
  return <SubscribersManager subscribers={(data ?? []) as SubscriberRow[]} />;
}
