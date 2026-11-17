import type { SupabaseClient } from "@supabase/supabase-js";
import { button, contactBlock, detailTable, emailLayout, heading, kicker, paragraph } from "@/lib/email-template";
import { eventTypeLabel } from "@/lib/event-types";
import { mailConfigured, sendMail } from "@/lib/mail";
import { fmtHM, melbourneToday } from "@/lib/prayer";
import { SITE_URL } from "@/lib/site-url";

type EventForEmail = {
  id: string;
  title: string;
  event_type: string;
  short_description: string;
  event_date: string;
  event_time: string;
  end_date: string | null;
  end_time: string | null;
  place: string;
};

const dateText = (d: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));

// "Today", "Tomorrow", "In 3 days", or "On now" for a multi-day event that has already started.
function untilLabel(eventDate: string, endDate: string | null): string {
  const days = Math.round((Date.parse(`${eventDate}T00:00:00Z`) - Date.parse(`${melbourneToday()}T00:00:00Z`)) / 86_400_000);
  if (days < 0) return endDate && endDate >= melbourneToday() ? "On now" : "Today";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export type AnnounceResult = { status: "sent"; sent: number; failed: number } | { status: "not-configured" } | { status: "no-subscribers" };

// Emails every current subscriber about an event, one message each so every message carries
// that person's own unsubscribe link. Uses the admin's login to read the list.
export async function announceEvent(supabase: SupabaseClient, event: EventForEmail, kind: "new" | "reminder" = "new"): Promise<AnnounceResult> {
  const origin = SITE_URL;
  if (!mailConfigured()) return { status: "not-configured" };
  const { data, error } = await supabase.from("subscribers").select("email,unsub_token").eq("status", "subscribed");
  if (error) throw new Error(error.message);
  const people = data ?? [];
  if (people.length === 0) return { status: "no-subscribers" };

  const when = `${dateText(event.event_date)}, ${fmtHM(event.event_time.slice(0, 5))}${event.end_time ? ` to ${fmtHM(event.end_time.slice(0, 5))}` : ""}`;
  const link = `${origin}/events/${event.id}`;
  const label = untilLabel(event.event_date, event.end_date);
  const subject = kind === "reminder" ? `Reminder: ${event.title} (${label.toLowerCase()})` : `New event: ${event.title}`;
  const label2 = kind === "reminder" ? `Reminder: ${label}` : eventTypeLabel(event.event_type);

  // The same message for everyone except the unsubscribe link at the bottom.
  const body = [
    kicker(label2),
    heading(event.title),
    event.short_description ? paragraph(event.short_description) : "",
    detailTable([
      ["When", when],
      ["Where", event.place],
    ]),
    button(link, "See the details"),
    contactBlock(),
  ].join("\n");

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < people.length; i += 10) {
    const results = await Promise.allSettled(
      people.slice(i, i + 10).map((p) => {
        const unsubscribe = `${origin}/unsubscribe?t=${p.unsub_token}`;
        return sendMail({
          to: p.email,
          subject,
          headers: { "List-Unsubscribe": `<${unsubscribe}>` },
          text: `${event.title}\n${label2}\n\n${when}\n${event.place}\n\n${event.short_description}\n\nMore details: ${link}\n\nTo stop these emails: ${unsubscribe}`,
          html: emailLayout(body, { unsubscribeUrl: unsubscribe }),
        });
      }),
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else failed++;
    }
  }
  if (failed) console.error("Event email: some messages failed", { event: event.id, failed });
  return { status: "sent", sent, failed };
}
