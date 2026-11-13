import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/events-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { EventRow } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("events").select("id,title,event_type,short_description,description,photo_url,event_date,event_time,end_date,end_time,place,map_url,speaker,audience,notes,status").order("event_date", { ascending: true });
  if (error) return <LoadError error={error} />;
  return <EventsManager events={(data ?? []) as EventRow[]} today={melbourneToday()} />;
}
