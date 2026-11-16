import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/events-manager";
import { LoadError } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/auth";
import { melbourneToday } from "@/lib/prayer";
import type { EventRow } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };
// Saving an event can email a whole list, which takes longer than the default limit.
export const maxDuration = 60;

export default async function EventsPage() {
  const { supabase } = await requireAdmin();
  const [events, subscribers] = await Promise.all([
    supabase.from("events").select("id,title,event_type,short_description,description,photo_url,event_date,event_time,end_date,end_time,place,map_url,speaker,audience,notes,status,announced_at,last_reminder_on").order("event_date", { ascending: true }),
    // Left out of the error check: before the subscribers table exists this just counts as zero.
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
  ]);
  if (events.error) return <LoadError error={events.error} />;
  return <EventsManager events={(events.data ?? []) as EventRow[]} today={melbourneToday()} subscriberCount={subscribers.count ?? 0} />;
}
