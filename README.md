# Warrnambool Islamic Society website

Next.js 16 (App Router, Cache Components), Tailwind 4, Supabase (database, login, photo storage). Package manager: Bun.

## Run it

```bash
bun install
bun dev          # http://localhost:3000
bun test         # prayer times, Jumu'ah seasons, phone numbers
bun run build
```

Copy the two Supabase values into `.env.local` (not committed):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Mail (contact form and membership alerts) uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM`.

## Admin panel

The committee edits the site at `/admin` (news, events, members, team, prayer times, Jumu'ah, donations, website info, admin users).

- **First-time setup:** follow `supabase/README.md` (run `supabase/setup.sql`, create the admin login, close public sign-up, add the keys to Vercel).
- **Security check:** `node scripts/check-security.mjs` tests the database rules as an anonymous visitor.
- **Guide for the committee:** `docs/WIS-Admin-Guide.pdf`.

## How it fits together

- `src/lib/content.ts` reads published content with the visitor-level key. Each function is cached and tagged. If Supabase cannot be reached, the site falls back to `src/content/site.ts`.
- Admin saves are Server Actions in `src/lib/actions/`. Each one checks the person is an admin, validates the form with Zod, writes to Supabase, then calls `updateTag(...)` so the public pages refresh straight away.
- `src/proxy.ts` sends anyone who is not logged in away from `/admin`. This is a first check only: every admin page and action calls `requireAdmin()` (`src/lib/auth.ts`), and the database rules (Row Level Security) refuse writes from anyone who is not on the `admins` list.
- `src/lib/prayer.ts` calculates Azan for Warrnambool (Melbourne time zone, daylight saving automatic), Iqamah, Ramadan and the Jumu'ah season for a date.
- Pages that depend on today's date refresh within a minute (`cacheLife("minutes")`), and straight away after an admin save.
