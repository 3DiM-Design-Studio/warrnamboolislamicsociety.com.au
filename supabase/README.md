# Supabase setup (do this once)

The website and the admin panel read and write one Supabase project. These steps switch it on.

1. **Create the tables.** Open Supabase, go to **SQL Editor**, then **New query**. Paste all of `supabase/setup.sql` and press **Run**. It is safe to run again later. It creates the tables, the security rules, the photo storage and your first admin (`warrnambool.is@gmail.com`), and it loads the current website content (9 news posts, 9 team entries, phone numbers, email).
2. **Create the admin login.** Go to **Authentication**, then **Users**, then **Add user**. Use `warrnambool.is@gmail.com`, choose a strong password and tick **Auto Confirm User**.
3. **Close public sign-up.** Go to **Authentication**, then **Sign In / Providers** (or **Settings**). Turn **off** "Allow new users to sign up". Only people you add yourself can have a login.
4. **Add the keys to Vercel.** In Vercel, open the project, then **Settings**, then **Environment Variables**. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same values as `.env.local`) for Production and Preview, then redeploy.
5. **Check the security rules.** Run `node scripts/check-security.mjs`. Every line must say PASS.
6. **Sign in** at `/admin/login`.

## Notes

- The publishable key is safe to expose: the security rules (not the key) decide what visitors can see. Never put the **secret / service role** key in this project.
- New admins: add their email under **Admin users** in the panel, then create their login in Supabase (step 2).
- Prayer times stay **hidden** on the website until you switch them on under **Prayer times**.
- Jumu'ah starts as one season, all year, 12:30 PM (what the website showed before). Split it into seasons under **Jumu'ah** once the committee has agreed the dates.
