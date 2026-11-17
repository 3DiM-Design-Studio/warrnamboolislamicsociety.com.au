# Working rules for this project

The admin panel is used by non-technical committee members. They should never have to explain basic behaviour.
Before building anything, ask: **what would every well-made admin panel in the world do here?** Do that by default,
and mention only the choices that are genuinely open.

## Baseline behaviour (always)
- **Alerts** (numbers in the menu, bars on Overview) count what is new since *this admin* last opened that page.
  Opening the page clears it, however they got there. Use `src/lib/alerts.ts`; do not invent a per-page version.
- Every action shows a clear result. Errors say how to fix it. Buttons are disabled while working.
- Delete, remove and deny ask a plain **Yes / No** question first. Prefer a reversible option (draft, hide).
- Sign-in never reveals whether an account exists. Links expire and work once. Admin pages are never cached.
- Every list has search, filters, sorting, paging, a count, an empty message and "clear filters".
- Works at 360 px wide, with the keyboard, and with simple everyday words.
- A missing table or column must never crash a page: show what to do instead.

## When a change is done
1. Update the in-panel guide (`src/lib/guide-content.ts`) so it matches the screens.
2. If the database changes, edit `supabase/setup.sql` in place (safe to run twice) **and** give the user the exact SQL snippet to paste.
3. Run `tsc`, `eslint` and `next build` (use `node node_modules/...` on Windows). Fix every error before saying done.
4. Check the change yourself, by reading the code path end to end and by opening the page in the browser (both first load and reload). Say plainly what was checked and what was not.

## Workflow
- Do not commit or deploy until the user says "push". Leave `package-lock.json` out of commits.
- Never print or ask for secret keys. Server-only keys live in Vercel settings.
- Keep wording simple. Tell the user about any Supabase or Vercel step *before* it is needed.

## QA checklist (run on every change, no extra agent needed)
Source: standard QA practice, as listed by the AT*SQA tools directory (accessibility, responsive, performance, visual, security, bug reporting).
- **Looks right:** check each changed page at phone (390 px), tablet (768 px) and desktop (1280 px). Check first load AND reload.
- **Contrast:** text over photos and alert bars is readable.
- **Works:** every button and form does what its label says; errors say how to fix them.
- **Alerts:** clear when the page is opened, per admin (see src/lib/alerts.ts).
- **Speed:** no new slow queries on a page; no polling faster than needed.
- **Labels:** every input and icon-only button has a visible label or aria-label; every image has alt text (empty alt only for decoration).
- **Data:** the matching SQL is in supabase/setup.sql and is named in the reply to the user.

## Bug report format
Severity: Critical (blocks use or leaks data) / High (visible wrong behaviour) / Medium (works but poor) / Low (polish).
Priority: P1 now, P2 soon, P3 later.
Each bug: page, steps, what happened, what should happen, file and line.
