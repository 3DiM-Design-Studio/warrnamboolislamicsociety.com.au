// Everything the public website reads from Supabase. Each function is cached and tagged, so a
// save in the admin expires it straight away (see src/lib/tags.ts). If Supabase cannot be
// reached, the site falls back to the content that ships with the code (src/content/site.ts).
import { cacheLife, cacheTag } from "next/cache";
import { posts as staticPosts, officeBearers, site } from "@/content/site";
import {
  dayBoard,
  fmtHM,
  fmtTime,
  jumuahOn,
  melbourneToday,
  seasonRangeText,
  DEFAULT_RULES,
  type PrayerConfig,
  type Season,
} from "@/lib/prayer";
import { htmlToText } from "@/lib/sanitize";
import { createAnonClient, hasSupabase } from "@/lib/supabase/anon";
import { TAGS } from "@/lib/tags";
import type {
  DonationRow,
  EventRow,
  JumuahRow,
  PostRow,
  PrayerSettingsRow,
  RamadanRow,
  SettingsRow,
  TeamRow,
} from "@/lib/types";

export type PublicPost = Pick<PostRow, "id" | "slug" | "title" | "excerpt" | "body" | "photo_url" | "post_date" | "pinned"> & {
  preview: string;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fallbackPosts: PublicPost[] = staticPosts.map((p, i) => ({
  id: p.slug,
  slug: p.slug,
  title: p.title,
  excerpt: p.body[0] ?? "",
  body: p.body.map((para) => `<p>${esc(para)}</p>`).join(""),
  photo_url: null,
  post_date: p.date,
  pinned: i === 0,
  preview: p.body[0] ?? "",
}));

function toPublicPost(p: PostRow): PublicPost {
  return { ...p, preview: p.excerpt || htmlToText(p.body).slice(0, 220) };
}

const fallbackSettings: SettingsRow = {
  phones: site.phones.map((p) => p.replace("+61 0", "+61 ")),
  email: site.email,
  facebook: "",
  banner_on: false,
  banner_text: "",
};

export async function getSettings(): Promise<SettingsRow> {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("minutes");
  if (!hasSupabase) return fallbackSettings;
  const { data, error } = await createAnonClient().from("site_settings").select("phones,email,facebook,banner_on,banner_text").eq("id", 1).maybeSingle();
  if (error || !data) return fallbackSettings;
  return data as SettingsRow;
}

export async function getPosts(): Promise<PublicPost[]> {
  "use cache";
  cacheTag(TAGS.posts);
  cacheLife("minutes");
  if (!hasSupabase) return fallbackPosts;
  const { data, error } = await createAnonClient()
    .from("posts")
    .select("id,title,slug,excerpt,body,photo_url,post_date,status,pinned")
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("post_date", { ascending: false });
  if (error || !data) return fallbackPosts;
  return (data as PostRow[]).map(toPublicPost);
}

export async function getPost(slug: string): Promise<PublicPost | null> {
  "use cache";
  cacheTag(TAGS.posts);
  cacheLife("minutes");
  if (!hasSupabase) return fallbackPosts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await createAnonClient()
    .from("posts")
    .select("id,title,slug,excerpt,body,photo_url,post_date,status,pinned")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return fallbackPosts.find((p) => p.slug === slug) ?? null;
  return data ? toPublicPost(data as PostRow) : null;
}

export async function getUpcomingEvents(): Promise<EventRow[]> {
  "use cache";
  cacheTag(TAGS.events);
  cacheLife("minutes");
  if (!hasSupabase) return [];
  const { data, error } = await createAnonClient()
    .from("events")
    .select("id,title,event_date,event_time,place,status")
    .eq("status", "published")
    .gte("event_date", melbourneToday())
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });
  if (error || !data) return [];
  return data as EventRow[];
}

export type TeamGroup = { role: string; people: { id: string; name: string; photo_url: string | null }[] };

export async function getTeamGroups(): Promise<TeamGroup[]> {
  "use cache";
  cacheTag(TAGS.team);
  cacheLife("minutes");
  let rows: TeamRow[] | null = null;
  if (hasSupabase) {
    const { data, error } = await createAnonClient().from("team_members").select("id,name,role,photo_url,sort_order").order("sort_order", { ascending: true });
    if (!error && data) rows = data as TeamRow[];
  }
  if (!rows) {
    return officeBearers.map((o) => ({ role: o.role, people: o.names.map((name) => ({ id: name, name, photo_url: null })) }));
  }
  const groups: TeamGroup[] = [];
  for (const r of rows) {
    let g = groups.find((x) => x.role === r.role);
    if (!g) groups.push((g = { role: r.role, people: [] }));
    g.people.push({ id: r.id, name: r.name, photo_url: r.photo_url });
  }
  return groups;
}

export type JumuahInfo = {
  /** Today's time as text, for example "12:30 PM". Null when no season covers today. */
  today: string | null;
  seasons: { name: string; range: string; time: string }[];
};

export async function getJumuah(): Promise<JumuahInfo> {
  "use cache";
  cacheTag(TAGS.jumuah);
  cacheLife("minutes");
  const fallback: JumuahInfo = { today: "12:30 PM", seasons: [] };
  if (!hasSupabase) return fallback;
  const { data, error } = await createAnonClient()
    .from("jumuah_seasons")
    .select("id,name,start_month,start_day,end_month,end_day,jumuah_time");
  if (error || !data) return fallback;
  const seasons: Season[] = (data as JumuahRow[]).map((r) => ({ ...r, jumuah_time: r.jumuah_time.slice(0, 5) }));
  const now = jumuahOn(melbourneToday(), seasons);
  return {
    today: now ? fmtHM(now.jumuah_time) : null,
    seasons: seasons.map((s) => ({ name: s.name, range: seasonRangeText(s), time: fmtHM(s.jumuah_time) })),
  };
}

export type PublicBoard = {
  show: boolean;
  dateLabel: string;
  rows: { key: string; name: string; azan: string; iqamah: string; ramadan: boolean }[];
};

export async function getPrayerBoard(): Promise<PublicBoard> {
  "use cache";
  cacheTag(TAGS.prayer);
  cacheLife("minutes");
  const hidden: PublicBoard = { show: false, dateLabel: "", rows: [] };
  if (!hasSupabase) return hidden;
  const sb = createAnonClient();
  const [settings, ramadan] = await Promise.all([
    sb.from("prayer_settings").select("method,asr,rules,show_on_site").eq("id", 1).maybeSingle(),
    sb.from("ramadan_periods").select("id,name,start_date,end_date,isha_iqamah,taraweeh"),
  ]);
  if (settings.error || !settings.data || !settings.data.show_on_site) return hidden;
  const s = settings.data as PrayerSettingsRow;
  const cfg: PrayerConfig = { method: s.method, asr: s.asr, rules: { ...DEFAULT_RULES, ...s.rules } };
  const today = melbourneToday();
  const list = ((ramadan.data ?? []) as RamadanRow[]).map((r) => ({
    name: r.name,
    start_date: r.start_date,
    end_date: r.end_date,
    isha_iqamah: r.isha_iqamah.slice(0, 5),
    taraweeh: r.taraweeh.slice(0, 5),
  }));
  const board = dayBoard(today, cfg, list);
  return {
    show: true,
    dateLabel: new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${today}T12:00:00Z`)),
    rows: board.rows.map((r) => ({
      key: r.key,
      name: r.name,
      azan: r.azan == null ? "" : fmtTime(r.azan),
      iqamah: r.iqamah == null ? "" : fmtTime(r.iqamah),
      ramadan: r.ramadan,
    })),
  };
}

export async function getDonation(): Promise<DonationRow> {
  "use cache";
  cacheTag(TAGS.donations);
  cacheLife("minutes");
  const fallback: DonationRow = { intro: "", account_name: "", bsb: "", account_no: "", purposes: [] };
  if (!hasSupabase) return fallback;
  const { data, error } = await createAnonClient().from("donation_settings").select("intro,account_name,bsb,account_no,purposes").eq("id", 1).maybeSingle();
  if (error || !data) return fallback;
  return data as DonationRow;
}
