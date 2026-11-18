import { getEvent } from "@/lib/content";
import { eventCalendarFile } from "@/lib/event-dates";
import { SITE_URL } from "@/lib/site-url";

// /events/<id>/calendar gives a calendar file (.ics) that opens in Apple, Google or Outlook calendar.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const event = await getEvent(id);
  if (!event || event.status !== "published") return new Response("This event could not be found.", { status: 404 });
  const file = eventCalendarFile(event, `${SITE_URL}/events/${event.id}`);
  const name = event.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "event";
  return new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.ics"`,
    },
  });
}
