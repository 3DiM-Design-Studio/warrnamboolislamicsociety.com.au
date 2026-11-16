import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { IDLE_MS, SEEN_COOKIE, seenCookieOptions } from "@/lib/session-rules";

// Pages that work without being logged in: sign in, "forgot password", "first time here",
// and the page the emailed link opens.
const PUBLIC = ["/admin/login", "/admin/forgot", "/admin/first-time", "/admin/auth/confirm"];

// Runs before every /admin request. It keeps the login fresh, signs people out after a long
// time away, and sends people who are not logged in to the login page. This is only a first
// check: every admin page and action checks again, and the database itself refuses writes
// from anyone who is not an admin.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC.includes(pathname);

  if (!url || !key) {
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  if (!loggedIn && !isPublic) return NextResponse.redirect(new URL("/admin/login", request.url));

  if (loggedIn && !isPublic) {
    const seen = Number(request.cookies.get(SEEN_COOKIE)?.value);
    const now = Date.now();
    const known = Number.isFinite(seen) && seen > 0;

    // Away for too long: end the login and ask them to sign in again.
    if (known && now - seen > IDLE_MS) {
      await supabase.auth.signOut();
      const out = NextResponse.redirect(new URL("/admin/login?error=idle", request.url));
      response.cookies.getAll().forEach((c) => out.cookies.set(c));
      out.cookies.delete(SEEN_COOKIE);
      return out;
    }
    // Note the time of this visit (at most once a minute, to keep requests light).
    if (!known || now - seen > 60_000) response.cookies.set(SEEN_COOKIE, String(now), seenCookieOptions);
  }

  // Admin pages are private, so the browser must not keep copies (the Back button after logging out).
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
