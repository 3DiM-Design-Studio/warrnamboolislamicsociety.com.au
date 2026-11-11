import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/admin/icons";
import { LoadError } from "@/components/admin/setup-notice";
import { Badge, Card, CardHead } from "@/components/admin/ui";
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

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();
  const today = melbourneToday();

  const [posts, members, events, settings, prayer, ramadan, seasons] = await Promise.all([
    supabase.from("posts").select("status"),
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("event_date", today),
    supabase.from("site_settings").select("phones,email,facebook,banner_on,banner_text").eq("id", 1).maybeSingle(),
    supabase.from("prayer_settings").select("rules,show_on_site").eq("id", 1).maybeSingle(),
    supabase.from("ramadan_periods").select("id,name,start_date,end_date,isha_iqamah,taraweeh"),
    supabase.from("jumuah_seasons").select("id,name,start_month,start_day,end_month,end_day,jumuah_time"),
  ]);
  const error = posts.error ?? members.error ?? prayer.error ?? seasons.error ?? settings.error;
  if (error) return <LoadError error={error} />;

  const postRows = posts.data ?? [];
  const live = postRows.filter((p) => p.status === "published").length;
  const drafts = postRows.length - live;
  const memberCount = members.count ?? 0;

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
    ? { name: upcoming.name, azan: upcoming.azan as number, mins: (upcoming.azan as number) - now, tomorrow: false }
    : (() => {
        const tomorrow = addDays(today, 1);
        const t = dayBoard(timetableAzan(tomorrow) ?? azanToday, rules, activeRamadan(tomorrow, ram)).rows[0];
        return { name: t.name, azan: t.azan as number, mins: (t.azan as number) + 1440 - now, tomorrow: true };
      })();

  const seasonList: Season[] = ((seasons.data ?? []) as JumuahRow[]).map((s) => ({ ...s, jumuah_time: s.jumuah_time.slice(0, 5) }));
  const jumuah = jumuahOn(today, seasonList);
  const coverage = seasonCoverage(seasonList);

  const s = settings.data as SettingsRow | null;
  const badPhone = (s?.phones ?? []).some((ph) => !normalisePhone(ph).ok);

  const todo: { text: string; href: string; label: string }[] = [];
  if (drafts) todo.push({ text: `${drafts} news post${drafts > 1 ? "s" : ""} not on the website yet`, href: "/admin/posts", label: "Open" });
  if (badPhone) todo.push({ text: "A phone number needs fixing", href: "/admin/info", label: "Fix" });
  if (!coverage.ok) todo.push({ text: "Some days have no Jumu’ah time", href: "/admin/jumuah", label: "Fix" });
  if (!p?.show_on_site) todo.push({ text: "Iqamah times are hidden on the website", href: "/admin/prayer", label: "Check" });

  const kpi = (icon: IconName, label: string, value: string, sub: string) => (
    <Card className="grid gap-3">
      <div className="flex items-center gap-3 font-semibold">
        <span className="grid size-10 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
          <Icon name={icon} />
        </span>
        {label}
      </div>
      <div className="text-3xl font-bold leading-tight tracking-tight tabular-nums">{value}</div>
      <div className="text-sm text-muted">{sub}</div>
    </Card>
  );

  const quick: { href: string; label: string; icon: IconName }[] = [
    { href: "/admin/posts", label: "Write a post", icon: "posts" },
    { href: "/admin/events", label: "Add an event", icon: "events" },
    { href: "/admin/members", label: "See members", icon: "members" },
    { href: "/admin/jumuah", label: "Jumu’ah time", icon: "jumuah" },
  ];

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpi("clock", "Next prayer", `${next.name} ${fmtTime(next.azan)}`, `In ${inMinutes(next.mins)}${next.tomorrow ? " (tomorrow)" : ""}`)}
        {kpi("jumuah", "Jumu’ah", jumuah ? fmtHM(jumuah.jumuah_time) : "Not set", "Every Friday")}
        {kpi("posts", "News posts", String(live), `${drafts} not on the website`)}
        {kpi("members", "Members", String(memberCount), "On the list")}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHead title="Today’s prayer times">
            <Link href="/admin/prayer" className="rounded-full border border-[#cfd1c7] bg-white px-3.5 py-1.5 text-[13px] font-semibold hover:border-brand-dark">
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

        <div className="grid gap-5">
          <Card>
            <CardHead title="Quick actions" />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {quick.map((q) => (
                <Link key={q.href} href={q.href} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5 font-semibold hover:border-brand-dark">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
                    <Icon name={q.icon} size={18} />
                  </span>
                  {q.label}
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <CardHead title="To do" />
            {todo.length === 0 ? (
              <p className="text-sm text-muted">Nothing to do. All good.</p>
            ) : (
              <div className="grid">
                {todo.map((t) => (
                  <div key={t.text} className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm first:border-0 first:pt-0">
                    <span>{t.text}</span>
                    <Link href={t.href} className="shrink-0 rounded-full border border-[#cfd1c7] bg-white px-3.5 py-1.5 text-[13px] font-semibold hover:border-brand-dark">
                      {t.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {events.count != null && <p className="mt-3 text-[13px] text-muted">{events.count} upcoming event{events.count === 1 ? "" : "s"} on the website.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
