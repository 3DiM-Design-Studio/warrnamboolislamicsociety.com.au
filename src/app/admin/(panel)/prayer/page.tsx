import type { Metadata } from "next";
import { LoadError } from "@/components/admin/setup-notice";
import { PrayerManager } from "@/components/admin/prayer-manager";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_RULES, melbourneToday } from "@/lib/prayer";
import type { PrayerSettingsRow, RamadanRow } from "@/lib/types";

export const metadata: Metadata = { title: "Prayer times" };

export default async function PrayerPage() {
  const { supabase } = await requireAdmin();
  const [settings, ramadan] = await Promise.all([
    supabase.from("prayer_settings").select("method,asr,rules,show_on_site").eq("id", 1).maybeSingle(),
    supabase.from("ramadan_periods").select("id,name,start_date,end_date,isha_iqamah,taraweeh").order("start_date", { ascending: true }),
  ]);
  const error = settings.error ?? ramadan.error;
  if (error) return <LoadError error={error} />;
  const row = settings.data as PrayerSettingsRow | null;
  const merged: PrayerSettingsRow = {
    method: row?.method ?? "mwl",
    asr: row?.asr ?? "standard",
    rules: { ...DEFAULT_RULES, ...(row?.rules ?? {}) },
    show_on_site: row?.show_on_site ?? false,
  };
  return <PrayerManager settings={merged} ramadan={(ramadan.data ?? []) as RamadanRow[]} today={melbourneToday()} />;
}
