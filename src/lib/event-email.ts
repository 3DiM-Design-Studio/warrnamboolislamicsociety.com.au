import type { SupabaseClient } from "@supabase/supabase-js";
import { eventTypeLabel } from "@/lib/event-types";
import { mailConfigured, sendMail } from "@/lib/mail";
import { fmtHM } from "@/lib/prayer";
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

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const dateText = (d: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));

export type AnnounceResult = { status: "sent"; sent: number; failed: number } | { status: "not-configured" } | { status: "no-subscribers" };

// Emails every current subscriber about an event, one message each so every message carries
// that person's own unsubscribe link. Uses the admin's login to read the list.
export async function announceEvent(supabase: SupabaseClient, event: EventForEmail): Promise<AnnounceResult> {
  const origin = SITE_URL;
  if (!mailConfigured()) return { status: "not-configured" };
  const { data, error } = await supabase.from("subscribers").select("email,unsub_token").eq("status", "subscribed");
  if (error) throw new Error(error.message);
  const people = data ?? [];
  if (people.length === 0) return { status: "no-subscribers" };

  const when = `${dateText(event.event_date)}, ${fmtHM(event.event_time.slice(0, 5))}${event.end_time ? ` to ${fmtHM(event.end_time.slice(0, 5))}` : ""}`;
  const link = `${origin}/events/${event.id}`;
  const subject = `New event: ${event.title}`;

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
          text: `${event.title}\n${eventTypeLabel(event.event_type)}\n\n${when}\n${event.place}\n\n${event.short_description}\n\nMore details: ${link}\n\nTo stop these emails: ${unsubscribe}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#121512">
  <table role="presentation" style="margin:0 0 20px;border-collapse:collapse"><tr>
    <td style="padding:0 12px 0 0"><img src="${origin}/logo.jpg" width="56" height="56" alt="Warrnambool Islamic Society" style="display:block;border-radius:28px"></td>
    <td style="font-size:16px;font-weight:bold;color:#0f6a4d">Warrnambool Islamic Society</td>
  </tr></table>
  <p style="margin:0 0 8px;font-size:13px;color:#0f6a4d;font-weight:bold;text-transform:uppercase">${esc(eventTypeLabel(event.event_type))}</p>
  <h1 style="margin:0 0 16px;font-size:24px">${esc(event.title)}</h1>
  ${event.short_description ? `<p style="font-size:16px;line-height:1.5">${esc(event.short_description)}</p>` : ""}
  <p style="font-size:16px;line-height:1.6"><strong>When:</strong> ${esc(when)}<br><strong>Where:</strong> ${esc(event.place)}</p>
  <p style="margin:24px 0"><a href="${esc(link)}" style="background:#0f8a63;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">See the details</a></p>
  <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
  <p style="font-size:12px;color:#666">You are getting this because you subscribed to Warrnambool Islamic Society updates.<br><a href="${esc(unsubscribe)}" style="color:#666">Unsubscribe</a></p>
</div>`,
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
