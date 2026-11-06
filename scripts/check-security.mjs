// Checks the database security rules as an anonymous visitor (no login).
// Run after supabase/setup.sql:   node scripts/check-security.mjs
// Every check must say PASS. It never adds or changes real data.
import { readFileSync } from "node:fs";

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim();
  } catch {
    return undefined;
  }
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.local).");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const call = async (method, path, body, extra = {}) => {
  const res = await fetch(`${url}${path}`, { method, headers: { ...headers, ...extra }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: res.status, json, text };
};

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (${detail})`}`);
  if (!ok) failed++;
};
const notAllowed = (r) => r.status === 401 || r.status === 403 || (r.status >= 400 && r.status < 500);
const noRowsChanged = (r) => notAllowed(r) || (Array.isArray(r.json) && r.json.length === 0);

// 1. Visitors can read published content only
const posts = await call("GET", "/rest/v1/posts?select=status");
check("Visitors can read posts", posts.status === 200 && Array.isArray(posts.json), `status ${posts.status}: ${posts.text.slice(0, 120)}`);
check("Visitors see published posts only", Array.isArray(posts.json) && posts.json.every((p) => p.status === "published"));
const events = await call("GET", "/rest/v1/events?select=status");
check("Visitors see published events only", events.status === 200 && Array.isArray(events.json) && events.json.every((p) => p.status === "published"));
for (const t of ["site_settings", "team_members", "prayer_settings", "ramadan_periods", "jumuah_seasons", "donation_settings"]) {
  const r = await call("GET", `/rest/v1/${t}?select=*&limit=1`);
  check(`Visitors can read ${t}`, r.status === 200, `status ${r.status}`);
}

// 2. Visitors cannot read private data
const members = await call("GET", "/rest/v1/members?select=*");
check("Visitors cannot read members", members.status === 200 ? Array.isArray(members.json) && members.json.length === 0 : notAllowed(members), `status ${members.status}`);
const admins = await call("GET", "/rest/v1/admins?select=*");
check("Visitors cannot read the admin list", admins.status === 200 ? Array.isArray(admins.json) && admins.json.length === 0 : notAllowed(admins), `status ${admins.status}`);

// 3. Visitors cannot write content
const prefer = { Prefer: "return=representation" };
const ins = await call("POST", "/rest/v1/posts", { title: "x", slug: "security-test", body: "x", status: "published" }, prefer);
check("Visitors cannot add posts", notAllowed(ins), `status ${ins.status}`);
const upd = await call("PATCH", "/rest/v1/site_settings?id=eq.1", { email: "hacked@example.com" }, prefer);
check("Visitors cannot change settings", noRowsChanged(upd), `status ${upd.status}: ${upd.text.slice(0, 120)}`);
const del = await call("DELETE", "/rest/v1/posts?status=eq.published", null, prefer);
check("Visitors cannot delete posts", noRowsChanged(del), `status ${del.status}: ${del.text.slice(0, 120)}`);
const promote = await call("POST", "/rest/v1/admins", { email: "attacker@example.com" }, prefer);
check("Visitors cannot make themselves admin", notAllowed(promote), `status ${promote.status}`);

// 4. A visitor's membership request can only be "new"
const member = await call("POST", "/rest/v1/members", { name: "Security Test", email: "security-test@example.com", status: "member" }, prefer);
check("Visitors cannot add an already-approved member", notAllowed(member), `status ${member.status}`);

// 5. Photos
const up = await fetch(`${url}/storage/v1/object/photos/security-test.jpg`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "image/jpeg" }, body: new Uint8Array([255, 216, 255, 217]) });
check("Visitors cannot upload photos", up.status >= 400 && up.status < 500, `status ${up.status}`);

// 6. The admin check says no to visitors
const rpc = await call("POST", "/rest/v1/rpc/is_admin", {});
check("is_admin() is false for visitors", rpc.status === 200 && rpc.json === false, `status ${rpc.status}: ${rpc.text.slice(0, 80)}`);

console.log(failed === 0 ? "\nAll security checks passed." : `\n${failed} check(s) FAILED. Do not publish until these are fixed.`);
process.exit(failed === 0 ? 0 : 1);
