import type { Metadata } from "next";
import { LoadError } from "@/components/admin/setup-notice";
import { PrayerManager } from "@/components/admin/prayer-manager";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_RULES, melbourneToday } from "@/lib/prayer";
import { timetableAzan } from "@/lib/timetable";
import type { JumuahRow, PrayerSettingsRow, RamadanRow } from "@/lib/types";

export const metadata: Metadata = { title: "Prayer times" };

export default async function PrayerPage() {
  const { supabase } = await requireAdmin();
  const [settings, ramadan, seasons] = await Promise.all([
    supabase.from("prayer_settings").select("rules,show_on_site").eq("id", 1).maybeSingle(),
    supabase.from("ramadan_periods").select("id,name,start_date,end_date,isha_iqamah,taraweeh").order("start_date", { ascending: true }),
    supabase.from("jumuah_seasons").select("id,name,start_month,start_day,end_month,end_day,jumuah_time").order("start_month", { ascending: true }).order("start_day", { ascending: true }),
  ]);
  const error = settings.error ?? ramadan.error ?? seasons.error;
  if (error) return <LoadError error={error} />;
  const row = settings.data as PrayerSettingsRow | null;
  const merged: PrayerSettingsRow = {
    rules: { ...DEFAULT_RULES, ...(row?.rules ?? {}) },
    show_on_site: row?.show_on_site ?? false,
  };
  const today = melbourneToday();
  const azan = timetableAzan(today);
  if (!azan) return <LoadError error={{ message: "The prayer timetable has no entry for today." }} />;
  return <PrayerManager settings={merged} ramadan={(ramadan.data ?? []) as RamadanRow[]} seasons={(seasons.data ?? []) as JumuahRow[]} today={today} azan={azan} />;
}
