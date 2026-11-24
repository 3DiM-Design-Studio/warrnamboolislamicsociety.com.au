import type { IqamahRules } from "@/lib/prayer";

export type Status = "draft" | "published";

export type SettingsRow = {
  phones: string[];
  email: string;
  facebook: string;
  whatsapp: string;
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
  /** Login email of the admin who created the post. Empty for older posts. */
  author: string;
  created_at: string;
  updated_at: string;
};

export type EventStatus = Status | "cancelled";

export type EventRow = {
  id: string;
  title: string;
  event_type: string;
  short_description: string;
  description: string;
  photo_url: string | null;
  event_date: string;
  event_time: string; // HH:MM:SS from Postgres
  end_date: string | null;
  end_time: string | null;
  place: string;
  map_url: string;
  speaker: string;
  audience: string;
  notes: string;
  status: EventStatus;
  /** When subscribers were emailed about this event; null if they never were. */
  announced_at?: string | null;
  /** The day the last reminder email was sent, YYYY-MM-DD (Melbourne time). */
  last_reminder_on?: string | null;
};

export type MemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  postcode: string;
  spouse: string;
  /** Children joined with "; " */
  children: string;
  /** Amount paid in cents when they joined online, otherwise null. */
  amount_cents: number | null;
  status: "new" | "member";
  /** YYYY-MM-DD */
  submitted_date: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  /** The day they signed up, YYYY-MM-DD (Melbourne time). */
  subscribed_date: string;
};

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  /** new = not answered yet, replied = answered. */
  status: "new" | "replied";
  /** The day the message was sent, YYYY-MM-DD (Melbourne time). */
  submitted_date: string;
};

export type DonationRow = {
  id: string;
  donor_name: string;
  email: string;
  phone: string;
  amount_cents: number;
  frequency: "once" | "monthly";
  anonymous: boolean;
  wants_receipt: boolean;
  dedication: string;
  /** The day the payment was taken, YYYY-MM-DD (Melbourne time). */
  submitted_date: string;
  /** Stripe ids, used to rebuild the same receipt number. */
  payment_intent?: string | null;
  invoice_id?: string | null;
};

export type TeamRow = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  sort_order: number;
};

export type GalleryRow = {
  id: string;
  caption: string;
  album: string;
  photo_url: string;
  thumb_url: string;
  width: number | null;
  height: number | null;
  taken_on: string | null;
  featured: boolean;
  visible: boolean;
  created_at: string;
};

export type PrayerSettingsRow = {
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

export type AdminRow = { email: string; created_at: string };

/** One question and answer shown on a public page. */
export type FaqRow = { id: string; page: "home" | "donate"; question: string; answer: string; sort_order: number };

/** Someone who asked to become an admin and is waiting for an approval. */
export type AdminRequestRow = { id: string; email: string; name: string; created_at: string };

/** What server actions return to the form that called them. */
export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  at: number;
} | null;
