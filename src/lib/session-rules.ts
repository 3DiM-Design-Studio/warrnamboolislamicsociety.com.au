// How long an admin can be away before they are signed out. Shared by the gate (proxy), the sign-in
// actions and the in-page timer, so there is one number to change.

/** Signed out after this long with no activity: 8 hours. */
export const IDLE_MS = 8 * 60 * 60 * 1000;

/** The page shows a "Stay signed in?" notice this long before that happens. */
export const IDLE_WARN_MS = 5 * 60 * 1000;

/** Cookie holding the time of the last admin request. */
export const SEEN_COOKIE = "wis_seen";

export const seenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
