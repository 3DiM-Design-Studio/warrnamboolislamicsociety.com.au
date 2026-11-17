// The one rule for every alert in the admin (dashboard bars and the numbers in the menu):
//
//   An alert counts what arrived since THIS admin last opened that page.
//   Opening the page (by the alert, the menu, or typing the address) clears it for that admin only.
//
// Each admin has their own "last seen" time per section, kept in the admin_seen table.
// To give another page an alert: add it to SECTIONS and give its table a created_at column.

export const SECTIONS = {
  messages: { table: "contacts", href: "/admin/messages" },
  members: { table: "members", href: "/admin/members" },
  donations: { table: "donations", href: "/admin/donations" },
  admins: { table: "admin_requests", href: "/admin/admins" },
} as const;

export type AlertSection = keyof typeof SECTIONS;
export type AlertCounts = Record<AlertSection, number>;

export const NO_ALERTS: AlertCounts = { messages: 0, members: 0, donations: 0, admins: 0 };

/** The section whose page this address belongs to, if it has an alert. */
export function sectionOfPath(pathname: string): AlertSection | null {
  const hit = (Object.keys(SECTIONS) as AlertSection[]).find((s) => pathname === SECTIONS[s].href || pathname.startsWith(`${SECTIONS[s].href}/`));
  return hit ?? null;
}
