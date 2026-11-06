-- Warrnambool Islamic Society: database setup for Supabase.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- It is safe to run more than once.

-- ============ 1. Admin list and helper ============
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ============ 2. Tables ============
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  phones text[] not null default '{}',
  email text not null default '',
  facebook text not null default '',
  banner_on boolean not null default false,
  banner_text text not null default '' check (char_length(banner_text) <= 200),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  body text not null default '' check (char_length(body) <= 60000),
  photo_url text,
  post_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  event_date date not null,
  event_time time not null,
  place text not null default 'To be announced' check (char_length(place) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null default '' check (char_length(phone) <= 40),
  details text not null default '' check (char_length(details) <= 600),
  amount_cents int check (amount_cents is null or amount_cents >= 0),
  payment_intent text unique,
  status text not null default 'new' check (status in ('new', 'member')),
  created_at timestamptz not null default now()
);
-- (for a database created by an earlier version of this file)
alter table public.members add column if not exists details text not null default '';
alter table public.members add column if not exists amount_cents int;
alter table public.members add column if not exists payment_intent text unique;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  role text not null check (char_length(role) between 1 and 120),
  photo_url text,
  sort_order int not null default 0
);

create table if not exists public.prayer_settings (
  id int primary key default 1 check (id = 1),
  rules jsonb not null,
  show_on_site boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.prayer_settings drop column if exists method;
alter table public.prayer_settings drop column if exists asr;

create table if not exists public.ramadan_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  start_date date not null,
  end_date date not null,
  isha_iqamah time not null,
  taraweeh time not null,
  check (end_date >= start_date)
);

create table if not exists public.jumuah_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  start_month smallint not null check (start_month between 1 and 12),
  start_day smallint not null check (start_day between 1 and 31),
  end_month smallint not null check (end_month between 1 and 12),
  end_day smallint not null check (end_day between 1 and 31),
  jumuah_time time not null
);

-- The Donate page uses Stripe, so there is no donation_settings table.
drop table if exists public.donation_settings;

-- ============ 3. Security rules (Row Level Security) ============
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;
alter table public.members enable row level security;
alter table public.team_members enable row level security;
alter table public.prayer_settings enable row level security;
alter table public.ramadan_periods enable row level security;
alter table public.jumuah_seasons enable row level security;

-- Remove old versions of these rules so the file can be run again
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and policyname like 'wis\_%' escape '\'
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Admin list: only admins can see or change it
create policy wis_admins_all on public.admins for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Content everyone may read; only admins may change
create policy wis_settings_read on public.site_settings for select to anon, authenticated using (true);
create policy wis_settings_write on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy wis_team_read on public.team_members for select to anon, authenticated using (true);
create policy wis_team_write on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy wis_prayer_read on public.prayer_settings for select to anon, authenticated using (true);
create policy wis_prayer_write on public.prayer_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy wis_ramadan_read on public.ramadan_periods for select to anon, authenticated using (true);
create policy wis_ramadan_write on public.ramadan_periods for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy wis_jumuah_read on public.jumuah_seasons for select to anon, authenticated using (true);
create policy wis_jumuah_write on public.jumuah_seasons for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- Posts and events: visitors see published ones only; admins see everything
create policy wis_posts_read on public.posts for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy wis_posts_write on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy wis_events_read on public.events for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy wis_events_write on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Members: visitors may only add a NEW request (they cannot read anyone's details)
create policy wis_members_join on public.members for insert to anon, authenticated with check (status = 'new');
create policy wis_members_admin on public.members for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ 4. Photo storage ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists wis_photos_read on storage.objects;
drop policy if exists wis_photos_insert on storage.objects;
drop policy if exists wis_photos_update on storage.objects;
drop policy if exists wis_photos_delete on storage.objects;
create policy wis_photos_read on storage.objects for select using (bucket_id = 'photos');
create policy wis_photos_insert on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_admin());
create policy wis_photos_update on storage.objects for update to authenticated using (bucket_id = 'photos' and public.is_admin());
create policy wis_photos_delete on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_admin());

-- ============ 5. First admin ============
insert into public.admins (email) values ('warrnambool.is@gmail.com') on conflict do nothing;

-- ============ 6. Starting content (from the current website) ============
insert into public.site_settings (id, phones, email, facebook, banner_on, banner_text)
values (1, array['+61 3 5907 1724', '+61 493 187 858', '+61 408 307 364', '+61 407 975 314'], 'warrnambool.is@gmail.com', '', false, '')
on conflict (id) do nothing;

-- Iqamah times stay hidden on the website until the committee switches them on.
insert into public.prayer_settings (id, rules, show_on_site)
values (1, '{
  "fajr":    {"mode": "offset", "offset": 20, "time": "06:00"},
  "dhuhr":   {"mode": "offset", "offset": 15, "time": "13:15"},
  "asr":     {"mode": "offset", "offset": 15, "time": "16:30"},
  "maghrib": {"mode": "offset", "offset": 5,  "time": "19:00"},
  "isha":    {"mode": "offset", "offset": 15, "time": "20:30"}
}'::jsonb, false)
on conflict (id) do nothing;

-- One season, all year, 12:30 PM (what the website shows today). The committee can split it into seasons.
insert into public.jumuah_seasons (name, start_month, start_day, end_month, end_day, jumuah_time)
select 'All year', 1, 1, 12, 31, '12:30'
where not exists (select 1 from public.jumuah_seasons);

insert into public.posts (title, slug, excerpt, body, post_date, status, pinned) values
  ($wis$WIS is now a registered charity with the ACNC, Alhamdulillah$wis$, $wis$wis-registered-charity-acnc$wis$, $wis$On behalf of the Warrnambool Islamic Society (WIS) and its committee, I am pleased to share some positive news with our brothers and sisters in the community...$wis$, $wis$<p>On behalf of the Warrnambool Islamic Society (WIS) and its committee, I am pleased to share some positive news with our brothers and sisters in the community. WIS has now been successfully registered with the Australian Charities and Not-for-profits Commission (ACNC). This means that we are officially recognised as a registered charitable not-for-profit organisation.</p><p>We are currently in the process of obtaining planning permission from the local city council. Due to an objection raised by a neighbouring business, the matter has been referred to the Victorian Civil and Administrative Tribunal (VCAT) for determination. As a result, the planning approval process will now proceed through VCAT.</p><p>Once this matter is resolved, we look forward to moving ahead with the next phase of the renovation so that we can establish a fit-for-purpose facility to support the ongoing charitable, educational, and community activities of our society.</p><p>We kindly ask for your ongoing prayers and support, including donations where possible. May Allah reward you for your efforts. JazakAllah Khairan.</p><p>Dr Rashid Mahmood, President, Warrnambool Islamic Society</p>$wis$, '2026-03-31', 'published', true),
  ($wis$ANZAC Day 2025$wis$, $wis$anzac-day-2025$wis$, $wis$The Warrnambool Islamic Society was honoured to attend the ANZAC Day commemorations.$wis$, $wis$<p>The Warrnambool Islamic Society was honoured to attend the ANZAC Day commemorations.</p>$wis$, '2025-04-26', 'published', false),
  ($wis$Special Ramadan sermon with Imam Muhammad Edwars$wis$, $wis$special-ramadan-sermon-2025$wis$, $wis$Date: 1 March 2025. Time: 6:30 PM, at Warrnambool Musalah.$wis$, $wis$<p>Date: 1 March 2025. Time: 6:30 PM, at Warrnambool Musalah.</p><p>The Warrnambool Islamic Society is honoured to welcome Imam Muhammad Edwars from Melbourne for a special Ramadan-themed sermon. The evening will include Quran recitation, a talk on Ramadan in Australia, a Q&amp;A session, and Maghrib prayer, iftar dinner, Isha and Taraweeh prayers.</p><p>Please bring some food to share, preferably divided into two portions: one for brothers and one for sisters.</p>$wis$, '2025-02-25', 'published', false),
  ($wis$Annual General Meeting 2024$wis$, $wis$annual-general-meeting-2024$wis$, $wis$The AGM has been brought forward to Friday 28 June at Isha time, instead of Sunday 30 June, due to non-availability of members. The Eid lunch has been postpo...$wis$, $wis$<p>The AGM has been brought forward to Friday 28 June at Isha time, instead of Sunday 30 June, due to non-availability of members. The Eid lunch has been postponed and a new date will be announced.</p>$wis$, '2024-06-25', 'published', false),
  ($wis$Eid-ul-Azha 2024$wis$, $wis$eid-ul-azha-2024$wis$, $wis$The Board of Imams of Australia has announced Eid-ul-Azha on Sunday 16 June 2024. Eid prayer will be at 8:30 AM sharp at the Musallah, followed by the Khutbah.$wis$, $wis$<p>The Board of Imams of Australia has announced Eid-ul-Azha on Sunday 16 June 2024. Eid prayer will be at 8:30 AM sharp at the Musallah, followed by the Khutbah.</p><p>There is no parking at the Musallah; please park outside on the green or along the road, and maintain the sanctity of the Musallah at all times.</p><p>Notice of AGM and Eid lunch: the AGM will be held at 12 PM on Sunday 30 June 2024, followed by Dhuhr prayer and Eid lunch. Nominations are sought for office bearers (president, general secretary and treasurer).</p>$wis$, '2024-06-11', 'published', false),
  ($wis$Jumu'ah time$wis$, $wis$jumuah-time$wis$, $wis$The Jumu'ah time has been fixed to 12:30 PM (during the spring). We look forward to seeing all of our brothers and sisters in attendance. JazakAllah.$wis$, $wis$<p>The Jumu'ah time has been fixed to 12:30 PM (during the spring). We look forward to seeing all of our brothers and sisters in attendance. JazakAllah.</p>$wis$, '2024-04-30', 'published', false),
  ($wis$Ramadan Iftar Programme, 16-03-2024$wis$, $wis$ramadan-iftar-programme-2024$wis$, $wis$Join us for the community iftar at the Musallah. Please bring food to share.$wis$, $wis$<p>Join us for the community iftar at the Musallah. Please bring food to share.</p>$wis$, '2024-03-16', 'published', false),
  ($wis$Ramadhan programme 1445H / 2024$wis$, $wis$ramadhan-2024$wis$, $wis$The Musallah opens for Isha followed by Taraweeh each night from Monday 11 March 2024, with the first day of fasting on 12 March 2024 as announced by the Aus...$wis$, $wis$<p>The Musallah opens for Isha followed by Taraweeh each night from Monday 11 March 2024, with the first day of fasting on 12 March 2024 as announced by the Australian National Imams Council.</p><p>We plan to have iftar together every Saturday at the Musallah, followed by Maghrib, Isha and Taraweeh, and to open the Musallah for Fajr every Saturday. Please bring food to share.</p>$wis$, '2024-03-11', 'published', false),
  ($wis$Warrnambool, a place with extreme beauty and nature$wis$, $wis$warrnambool-beauty-and-nature$wis$, $wis$A look at the natural beauty of the Warrnambool region that our community calls home.$wis$, $wis$<p>A look at the natural beauty of the Warrnambool region that our community calls home.</p>$wis$, '2023-11-07', 'published', false)
on conflict (slug) do nothing;

insert into public.team_members (name, role, sort_order)
select v.name, v.role, v.sort_order from (values
  ($wis$Mr. Manzoor Khanyari$wis$, $wis$Honorary Chairman$wis$, 10),
  ($wis$Dr. Rashid Mahmood$wis$, $wis$President$wis$, 20),
  ($wis$Mr. Mohammad Shamim$wis$, $wis$Vice Presidents$wis$, 30),
  ($wis$Mr. Iqbal Wahyudi$wis$, $wis$Vice Presidents$wis$, 40),
  ($wis$Mr. Mohammad Fawad$wis$, $wis$General Secretaries$wis$, 50),
  ($wis$Mr. Mohammed Zaid Fuzlul Haq$wis$, $wis$General Secretaries$wis$, 60),
  ($wis$Mr. Jawaid Hakimi$wis$, $wis$Treasurer$wis$, 70),
  ($wis$Dr. Sheeraz Ahmed$wis$, $wis$Information Secretary$wis$, 80),
  ($wis$Mr. Syed Usama Shahid Zaidi$wis$, $wis$IT and Website Support$wis$, 90)
) as v(name, role, sort_order)
where not exists (select 1 from public.team_members);
