import type { IqamahRules } from "@/lib/prayer";

export type Status = "draft" | "published";

export type SettingsRow = {
  phones: string[];
  email: string;
  facebook: string;
  banner_on: boolean;
  banner_text: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  photo_url: string | null;
  post_date: string;
  status: Status;
  pinned: boolean;
};

export type EventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string; // HH:MM:SS from Postgres
  place: string;
  status: Status;
};

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "member";
  created_at: string;
};

export type TeamRow = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  sort_order: number;
};

export type PrayerSettingsRow = {
  method: "mwl" | "egypt" | "karachi" | "isna" | "ummqura";
  asr: "standard" | "hanafi";
  rules: IqamahRules;
  show_on_site: boolean;
};

export type RamadanRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  isha_iqamah: string;
  taraweeh: string;
};

export type JumuahRow = {
  id: string;
  name: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  jumuah_time: string;
};

export type Purpose = { id: string; name: string; on: boolean };

export type DonationRow = {
  intro: string;
  account_name: string;
  bsb: string;
  account_no: string;
  purposes: Purpose[];
};

export type AdminRow = { email: string; created_at: string };

/** What server actions return to the form that called them. */
export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  at: number;
} | null;
