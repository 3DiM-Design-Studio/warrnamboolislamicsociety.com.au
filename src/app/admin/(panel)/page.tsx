import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/admin/icons";
import { LoadError } from "@/components/admin/setup-notice";
import { Badge, Card, CardHead } from "@/components/admin/ui";
import { getAlertCounts } from "@/lib/alert-counts";
import { SECTIONS, type AlertSection } from "@/lib/alerts";
import { requireAdmin } from "@/lib/auth";
import {
  DEFAULT_RULES,
  activeRamadan,
  addDays,
  dayBoard,
  fmtHM,
  fmtTime,
  jumuahOn,
  melbourneMinutes,
  melbourneToday,
  normalisePhone,
  seasonCoverage,
  type Season,
} from "@/lib/prayer";
import { timetableAzan } from "@/lib/timetable";
import type { JumuahRow, PrayerSettingsRow, RamadanRow, SettingsRow } from "@/lib/types";

export const metadata: Metadata = { title: "Overview" };

const inMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// $4,280 for whole amounts, $12.50 when there are cents.
const money = (cents: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(cents / 100);
// Short labels above the chart bars: $950, $2.4k.
const short = (cents: number) => {
  const d = cents / 100;
  return d >= 1000 ? `$${(d / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${Math.round(d)}`;
};

const dayNumber = (date: string) => Math.floor(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) / 86400000);

// "2 hours ago", "Yesterday", "3 days ago".
function ago(timestamp: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Melbourne" }).format(new Date(timestamp));
}

type Activity = { id: string; at: string; icon: IconName; text: string; href: string };

export default async function OverviewPage() {
  const { supabase, email } = await requireAdmin();
  const today = melbourneToday();
  const alerts = await getAlertCounts(supabase, email);

  // The first day of the month, five months back, so the chart covers 6 months.
  const year = +today.slice(0, 4);
  const month = +today.slice(5, 7);
  const monthKeys = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (5 - i), 1));
    return { key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, label: MONTHS[d.getUTCMonth()] };
  });
  const thisKey = monthKeys[5].key;
  const lastKey = monthKeys[4].key;
  const thisMonthStart = `${thisKey}-01`;

  const [posts, events, settings, prayer, ramadan, seasons, donations, waiting, subscribers, newSubscribers, adminRequests, nextEvent] = await Promise.all([
    supabase.from("posts").select("status"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").or(`end_date.gte.${today},and(end_date.is.null,event_date.gte.${today})`),
    supabase.from("site_settings").select("phones,email,facebook,banner_on,banner_text").eq("id", 1).maybeSingle(),
    supabase.from("prayer_settings").select("rules,show_on_site").eq("id", 1).maybeSingle(),
    supabase.from("ramadan_periods").select("id,name,start_date,end_date,isha_iqamah,taraweeh"),
    supabase.from("jumuah_seasons").select("id,name,start_month,start_day,end_month,end_day,jumuah_time"),
    supabase.from("donations").select("submitted_date,amount_cents").gte("submitted_date", `${monthKeys[0].key}-01`).limit(5000),
    supabase.from("contacts").select("submitted_date", { count: "exact" }).eq("status", "new").order("submitted_date", { ascending: true }).limit(1),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed").gte("subscribed_date", thisMonthStart),
    supabase.from("admin_requests").select("id", { count: "exact", head: true }),
    supabase.from("events").select("title,event_date,event_time").eq("status", "published").or(`end_date.gte.${today},and(end_date.is.null,event_date.gte.${today})`).order("event_date", { ascending: true }).order("event_time", { ascending: true }).limit(1),
  ]);
  const error = posts.error ?? prayer.error ?? seasons.error ?? settings.error;
  if (error) return <LoadError error={error} />;

  // ---- Posts, prayer times, Jumu'ah (as before) ----
  const postRows = posts.data ?? [];
  const drafts = postRows.length - postRows.filter((p) => p.status === "published").length;

  const p = prayer.data as PrayerSettingsRow | null;
  const rules = { ...DEFAULT_RULES, ...(p?.rules ?? {}) };
  const ram = ((ramadan.data ?? []) as RamadanRow[]).map((r) => ({
    name: r.name,
    start_date: r.start_date,
    end_date: r.end_date,
    isha_iqamah: r.isha_iqamah.slice(0, 5),
    taraweeh: r.taraweeh.slice(0, 5),
  }));
  const azanToday = timetableAzan(today);
  if (!azanToday) return <LoadError error={{ message: "The prayer timetable has no entry for today." }} />;
  const board = dayBoard(azanToday, rules, activeRamadan(today, ram));

  const now = melbourneMinutes();
  const upcoming = board.rows.find((r) => r.key !== "sunrise" && r.key !== "taraweeh" && r.azan != null && r.azan > now);
  const next = upcoming
    ? { key: upcoming.key, name: upcoming.name, azan: upcoming.azan as number, mins: (upcoming.azan as number) - now, tomorrow: false }
    : (() => {
        const tomorrow = addDays(today, 1);
        const t = dayBoard(timetableAzan(tomorrow) ?? azanToday, rules, activeRamadan(tomorrow, ram)).rows[0];
        return { key: t.key, name: t.name, azan: t.azan as number, mins: (t.azan as number) + 1440 - now, tomorrow: true };
      })();

  const seasonList: Season[] = ((seasons.data ?? []) as JumuahRow[]).map((s) => ({ ...s, jumuah_time: s.jumuah_time.slice(0, 5) }));
  const jumuah = jumuahOn(today, seasonList);
  const coverage = seasonCoverage(seasonList);

  const s = settings.data as SettingsRow | null;
  const badPhone = (s?.phones ?? []).some((ph) => !normalisePhone(ph).ok);

  // ---- Donations: this month, last month, last 6 months. A missing table just shows dashes. ----
  const donationsOk = !donations.error;
  const perMonth = new Map<string, { cents: number; count: number }>(monthKeys.map((m) => [m.key, { cents: 0, count: 0 }]));
  for (const d of (donations.data ?? []) as { submitted_date: string; amount_cents: number }[]) {
    const slot = perMonth.get(d.submitted_date.slice(0, 7));
    if (slot) {
      slot.cents += d.amount_cents;
      slot.count += 1;
    }
  }
  const thisMonth = perMonth.get(thisKey)!;
  const lastMonth = perMonth.get(lastKey)!;
  const donationSub = !donationsOk
    ? "Could not load donations"
    : thisMonth.count === 0
      ? "No donations yet this month"
      : lastMonth.cents > 0
        ? `${thisMonth.cents >= lastMonth.cents ? "+" : "−"}${Math.round((Math.abs(thisMonth.cents - lastMonth.cents) / lastMonth.cents) * 100)}% on last month · ${thisMonth.count} gift${thisMonth.count === 1 ? "" : "s"}`
        : `${thisMonth.count} gift${thisMonth.count === 1 ? "" : "s"} · none last month`;
  const chartMax = Math.max(1, ...monthKeys.map((m) => perMonth.get(m.key)!.cents));

  // ---- Messages waiting for a reply ----
  const waitingCount = waiting.error ? null : (waiting.count ?? 0);
  const oldestWaiting = (waiting.data ?? [])[0]?.submitted_date as string | undefined;
  const waitingDays = oldestWaiting ? Math.max(0, dayNumber(today) - dayNumber(oldestWaiting)) : 0;
  const waitingSub = waitingCount === null ? "Could not load messages" : waitingCount === 0 ? "All replied to" : waitingDays === 0 ? "Oldest: today" : `Oldest: ${waitingDays} day${waitingDays === 1 ? "" : "s"} ago`;

  // ---- Events and newsletter ----
  const eventRow = (nextEvent.data ?? [])[0] as { title: string; event_date: string; event_time: string } | undefined;
  const upcomingCount = events.count ?? 0;
  const eventValue = eventRow ? (eventRow.event_date < today ? "On now" : new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "short", day: "numeric" }).format(new Date(`${eventRow.event_date}T12:00:00Z`))) : "None";
  const eventSub = eventRow ? `${eventRow.title} · ${fmtHM(eventRow.event_time.slice(0, 5))}` : "No upcoming events";
  const subscriberCount = subscribers.error ? null : (subscribers.count ?? 0);
  const newThisMonth = newSubscribers.count ?? 0;

  // ---- To do ----
  const todo: { text: string; href: string; label: string }[] = [];
  const requests = adminRequests.count ?? 0;
  if (requests) todo.push({ text: `${requests} admin request${requests > 1 ? "s" : ""} waiting`, href: "/admin/admins", label: "Review" });
  if (drafts) todo.push({ text: `${drafts} news post${drafts > 1 ? "s" : ""} not on the website yet`, href: "/admin/posts", label: "Open" });
  if (!eventRow) todo.push({ text: "No upcoming events on the website", href: "/admin/events", label: "Add" });
  if (badPhone) todo.push({ text: "A phone number needs fixing", href: "/admin/info", label: "Fix" });
  if (!coverage.ok) todo.push({ text: "Some days have no Jumu’ah time", href: "/admin/prayer", label: "Fix" });
  if (!p?.show_on_site) todo.push({ text: "Iqamah times are hidden on the website", href: "/admin/prayer", label: "Check" });

  // ---- Recent activity: the newest few things from each area, merged ----
  const [actDonations, actMembers, actContacts, actPosts, actEvents] = await Promise.all([
    supabase.from("donations").select("id,donor_name,anonymous,amount_cents,frequency,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("members").select("id,first_name,last_name,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("contacts").select("id,name,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("events").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  const activity: Activity[] = [
    ...((actDonations.data ?? []) as { id: string; donor_name: string; anonymous: boolean; amount_cents: number; frequency: string; created_at: string }[]).map((d) => ({
      id: `d${d.id}`,
      at: d.created_at,
      icon: "donations" as IconName,
      text: `New donation · ${money(d.amount_cents)}${d.frequency === "monthly" ? " monthly" : ""}${d.anonymous || !d.donor_name ? "" : ` from ${d.donor_name}`}`,
      href: "/admin/donations",
    })),
    ...((actMembers.data ?? []) as { id: string; first_name: string; last_name: string; created_at: string }[]).map((m) => ({
      id: `m${m.id}`,
      at: m.created_at,
      icon: "members" as IconName,
      text: `New member · ${`${m.first_name} ${m.last_name}`.trim() || "Someone"}`,
      href: "/admin/members",
    })),
    ...((actContacts.data ?? []) as { id: string; name: string; created_at: string }[]).map((c) => ({
      id: `c${c.id}`,
      at: c.created_at,
      icon: "messages" as IconName,
      text: `Message from ${c.name || "someone"}`,
      href: "/admin/messages",
    })),
    ...((actPosts.data ?? []) as { id: string; title: string; status: string; updated_at: string }[]).map((x) => ({
      id: `p${x.id}`,
      at: x.updated_at,
      icon: "posts" as IconName,
      text: `Post “${x.title}” ${x.status === "published" ? "is on the website" : "saved as a draft"}`,
      href: "/admin/posts",
    })),
    ...((actEvents.data ?? []) as { id: string; title: string; status: string; updated_at: string }[]).map((x) => ({
      id: `e${x.id}`,
      at: x.updated_at,
      icon: "events" as IconName,
      text: `Event “${x.title}” ${x.status === "published" ? "is on the website" : "saved as a draft"}`,
      href: "/admin/events",
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  // ---- Pieces of the page ----
  const kpi = (href: string, icon: IconName, label: string, value: string, sub: string) => (
    <Link href={href} className="group block min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2">
      <Card className="grid h-full gap-3 transition group-hover:border-brand-dark">
        <div className="flex flex-col items-start gap-2 font-semibold sm:flex-row sm:items-center sm:gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
            <Icon name={icon} />
          </span>
          {label}
        </div>
        <div className="truncate text-xl font-bold leading-tight tracking-tight tabular-nums sm:text-3xl">{value}</div>
        <div className="line-clamp-2 text-sm text-muted">{sub}</div>
      </Card>
    </Link>
  );

  const quick: { href: string; label: string; icon: IconName }[] = [
    { href: "/admin/posts", label: "Write a post", icon: "posts" },
    { href: "/admin/events", label: "Add an event", icon: "events" },
    { href: "/admin/members", label: "See members", icon: "members" },
    { href: "/admin/donations", label: "See donations", icon: "donations" },
    { href: "/admin/messages", label: "Read messages", icon: "messages" },
    { href: "/admin/prayer", label: "Jumu’ah time", icon: "jumuah" },
    { href: "/admin/subscribers", label: "Newsletter", icon: "newsletter" },
    { href: "/admin/info", label: "Website info", icon: "info" },
  ];

  // Alert bars: what is new since this admin last opened each page. Opening the page clears the bar.
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many.replace("{n}", String(n)));
  const green = "border-[#0f8a63] bg-[#dcf1e8] text-[#0f6a4d]";
  const gold = "border-[#c9a227] bg-[#f6edd6] text-[#6b4d0c]";
  const bars: { section: AlertSection; icon: IconName; title: string; sub: string; button: string; className: string }[] = [
    { section: "messages" as const, icon: "messages" as const, title: plural(alerts.messages, "You have 1 new message", "You have {n} new messages"), sub: "From the website’s Contact page", button: "Read now", className: green },
    { section: "admins" as const, icon: "admins" as const, title: plural(alerts.admins, "1 person asked to become an admin", "{n} people asked to become admins"), sub: "Waiting for you to approve or deny", button: "Review now", className: gold },
    { section: "members" as const, icon: "members" as const, title: plural(alerts.members, "1 new member joined", "{n} new members joined"), sub: "From the website’s Membership form", button: "See members", className: green },
    { section: "donations" as const, icon: "donations" as const, title: plural(alerts.donations, "1 new donation", "{n} new donations"), sub: "From the website’s Donate page", button: "See donations", className: green },
  ].filter((b) => alerts[b.section] > 0);

  const chartSummary = monthKeys.map((m) => `${m.label} ${money(perMonth.get(m.key)!.cents)}`).join(", ");
  const smallButton = "shrink-0 rounded-full border border-[#cfd1c7] bg-white px-3.5 py-1.5 text-[13px] font-semibold hover:border-brand-dark";

  return (
    <>
      {bars.map((b) => (
        <Link key={b.section} href={SECTIONS[b.section].href} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 transition hover:brightness-95 sm:px-6 ${b.className}`}>
          <span className="grid size-10 place-items-center rounded-full bg-white">
            <Icon name={b.icon} />
          </span>
          <span className="min-w-0 flex-1 font-semibold">
            {b.title}
            <span className="block text-sm font-normal">{b.sub}</span>
          </span>
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold">{b.button}</span>
        </Link>
      ))}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {kpi("/admin/donations", "donations", "Donations this month", donationsOk ? money(thisMonth.cents) : "—", donationSub)}
        {kpi("/admin/messages", "messages", "Messages waiting", waitingCount === null ? "—" : String(waitingCount), waitingSub)}
        {kpi("/admin/events", "events", "Next event", eventValue, upcomingCount > 1 ? `${eventSub} · ${upcomingCount} coming up` : eventSub)}
        {kpi("/admin/subscribers", "newsletter", "Newsletter subscribers", subscriberCount === null ? "—" : String(subscriberCount), newThisMonth > 0 ? `+${newThisMonth} this month` : "None new this month")}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card>
          <CardHead title="To do" />
          {todo.length === 0 ? (
            <p className="text-sm text-muted">Nothing to do. All good.</p>
          ) : (
            <div className="grid">
              {todo.map((t) => (
                <div key={t.text} className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm first:border-0 first:pt-0">
                  <span>{t.text}</span>
                  <Link href={t.href} className={smallButton}>
                    {t.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHead title="Today’s prayer times">
            <Badge tone="gold">
              Next: {next.name} {inMinutes(next.mins)}
              {next.tomorrow ? " (tomorrow)" : ""}
            </Badge>
            <Link href="/admin/prayer" className={smallButton}>
              Change
            </Link>
          </CardHead>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[13px] text-muted">
                <tr>
                  <th className="py-1.5 font-semibold">Prayer</th>
                  <th className="py-1.5 font-semibold">Azan</th>
                  <th className="py-1.5 font-semibold">Iqamah</th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((r) => (
                  <tr key={r.key} className={"border-t border-border " + (r.key === "sunrise" ? "text-muted" : "")}>
                    <td className="py-2.5 font-semibold">
                      {r.name} {r.ramadan && <Badge tone="gold">Ramadan</Badge>}
                    </td>
                    <td className="py-2.5 tabular-nums">{r.azan == null ? "" : fmtTime(r.azan)}</td>
                    <td className="py-2.5 font-bold tabular-nums">{r.iqamah == null ? "" : fmtTime(r.iqamah)}</td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="py-2.5 font-semibold">Jumu’ah</td>
                  <td />
                  <td className="py-2.5 font-bold tabular-nums">{jumuah ? fmtHM(jumuah.jumuah_time) : <Badge tone="gold">No time set</Badge>}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card>
          <CardHead title="Recent activity" />
          {activity.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet. New donations, members, messages and posts will show here.</p>
          ) : (
            <ul className="grid min-w-0">
              {activity.map((a) => (
                <li key={a.id} className="min-w-0 border-t border-border first:border-0">
                  <Link href={a.href} className="flex min-w-0 items-center gap-3 rounded-lg py-2.5 hover:bg-background">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
                      <Icon name={a.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.text}</span>
                    <span className="shrink-0 text-[13px] text-muted">{ago(a.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHead title="Donations, last 6 months" />
          {!donationsOk ? (
            <p className="text-sm text-muted">The donations could not be loaded. Please try again in a moment.</p>
          ) : (
            <>
              <div role="img" aria-label={`Donations for the last 6 months: ${chartSummary}`} className="mt-7 grid h-40 grid-cols-6 items-end gap-2.5 pb-6 sm:gap-4">
                {monthKeys.map((m) => {
                  const v = perMonth.get(m.key)!;
                  const pct = Math.max(2, (v.cents / chartMax) * 100);
                  return (
                    <div key={m.key} className="relative h-full" aria-hidden>
                      {v.cents > 0 && (
                        <span className="absolute inset-x-0 text-center text-xs font-semibold tabular-nums" style={{ bottom: `calc(${pct}% + 4px)` }}>
                          {short(v.cents)}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 rounded-t-lg rounded-b-sm bg-linear-to-b from-[#c9f26b] to-[#00bf2e]" style={{ height: `${pct}%` }} />
                      <span className="absolute inset-x-0 -bottom-6 text-center text-xs text-muted">{m.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[13px] text-muted">
                {thisMonth.count > 0 ? `${MONTHS[+thisKey.slice(5, 7) - 1]}: ${money(thisMonth.cents)} from ${thisMonth.count} gift${thisMonth.count === 1 ? "" : "s"}.` : "Totals add up each month from the Donations page."}
              </p>
            </>
          )}
        </Card>
      </div>

      <Card>
        <CardHead title="Quick actions" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5 font-semibold hover:border-brand-dark">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
                <Icon name={q.icon} size={18} />
              </span>
              <span className="min-w-0">{q.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
