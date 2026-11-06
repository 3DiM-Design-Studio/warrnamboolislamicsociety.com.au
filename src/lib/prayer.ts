// Prayer maths for Warrnambool.
// - Iqamah is Azan plus a number of minutes, or a fixed time (iqamahFor, dayBoard).
// - azanTimes() calculates Azan from the sun's position (the method used by the adhan and praytimes
//   libraries) with daylight saving taken from the Australia/Melbourne time zone database. The website
//   currently shows the society's published timetable (src/content/prayer-times.json) instead; see
//   src/lib/timetable.ts.

export const TZ = "Australia/Melbourne";
export const LAT = -38.3818;
export const LNG = 142.4833;

export type MethodKey = "mwl" | "egypt" | "karachi" | "isna" | "ummqura";
export type AsrRule = "standard" | "hanafi";
export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type IqamahRule = { mode: "offset" | "fixed"; offset: number; time: string };
export type IqamahRules = Record<PrayerKey, IqamahRule>;
export type PrayerConfig = { method: MethodKey; asr: AsrRule; rules: IqamahRules };
export type Ramadan = { name: string; start_date: string; end_date: string; isha_iqamah: string; taraweeh: string };
export type Season = {
  name: string;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  jumuah_time: string; // "HH:MM"
};

export const METHODS: Record<MethodKey, { name: string; fajr: number; isha?: number; ishaMin?: number }> = {
  mwl: { name: "Muslim World League", fajr: 18, isha: 17 },
  egypt: { name: "Egyptian General Authority", fajr: 19.5, isha: 17.5 },
  karachi: { name: "University of Islamic Sciences, Karachi", fajr: 18, isha: 18 },
  isna: { name: "Islamic Society of North America", fajr: 15, isha: 15 },
  ummqura: { name: "Umm al-Qura", fajr: 18.5, ishaMin: 90 },
};

export const PRAYERS: [PrayerKey, string][] = [
  ["fajr", "Fajr"],
  ["dhuhr", "Dhuhr"],
  ["asr", "Asr"],
  ["maghrib", "Maghrib"],
  ["isha", "Isha"],
];

export const DEFAULT_RULES: IqamahRules = {
  fajr: { mode: "offset", offset: 20, time: "06:00" },
  dhuhr: { mode: "offset", offset: 15, time: "13:15" },
  asr: { mode: "offset", offset: 15, time: "16:30" },
  maghrib: { mode: "offset", offset: 5, time: "19:00" },
  isha: { mode: "offset", offset: 15, time: "20:30" },
};

/* ---------- small helpers ---------- */
const R = Math.PI / 180;
const DG = 180 / Math.PI;
const sin = (a: number) => Math.sin(a * R);
const cos = (a: number) => Math.cos(a * R);
const tan = (a: number) => Math.tan(a * R);
const asin = (x: number) => Math.asin(x) * DG;
const acos = (x: number) => Math.acos(x) * DG;
const atan2 = (y: number, x: number) => Math.atan2(y, x) * DG;
const acot = (x: number) => Math.atan(1 / x) * DG;
const fixA = (a: number) => ((a % 360) + 360) % 360;
const fixH = (h: number) => ((h % 24) + 24) % 24;

export function parseHM(t: string): number {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
}
export function fmtTime(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60) % 24;
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
export const fmtHM = (t: string) => fmtTime(parseHM(t));

/** Today's date in Melbourne as YYYY-MM-DD. */
export function melbourneToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}
/** Minutes since midnight in Melbourne. */
export function melbourneMinutes(now: Date = new Date()): number {
  const p: Record<string, number> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", hour: "numeric", minute: "numeric" })
    .formatToParts(now)
    .forEach((x) => {
      if (x.type === "hour" || x.type === "minute") p[x.type] = Number(x.value);
    });
  return p.hour * 60 + p.minute;
}
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function weekday(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

function julian(y: number, m: number, d: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPos(jd: number) {
  const D = jd - 2451545.0;
  const g = fixA(357.529 + 0.98560028 * D);
  const q = fixA(280.459 + 0.98564736 * D);
  const L = fixA(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = fixH(atan2(cos(e) * sin(L), cos(L)) / 15);
  let eq = q / 15 - RA;
  if (eq > 12) eq -= 24;
  if (eq < -12) eq += 24;
  return { decl: asin(sin(e) * sin(L)), eq };
}

function tzOffsetMin(y: number, m: number, d: number): number {
  const dt = new Date(Date.UTC(y, m - 1, d, 2, 0, 0));
  const p: Record<string, number> = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
    .formatToParts(dt)
    .forEach((x) => {
      if (x.type !== "literal") p[x.type] = Number(x.value);
    });
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - dt.getTime()) / 60000;
}

export type AzanTimes = Record<PrayerKey | "sunrise", number>;

/** Azan times in minutes after local midnight for a YYYY-MM-DD date. */
export function azanTimes(date: string, cfg: Pick<PrayerConfig, "method" | "asr">): AzanTimes {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  const sp = sunPos(julian(y, m, d) - LNG / 360 + 0.5);
  const noon = 12 - sp.eq - LNG / 15; // solar noon in UTC hours
  const meth = METHODS[cfg.method] ?? METHODS.mwl;

  const at = (angle: number, before: boolean) => {
    const t = acos((-sin(angle) - sin(sp.decl) * sin(LAT)) / (cos(sp.decl) * cos(LAT))) / 15;
    return noon + (before ? -t : t);
  };
  const factor = cfg.asr === "hanafi" ? 2 : 1;
  const alt = acot(factor + tan(Math.abs(LAT - sp.decl)));
  const asr = noon + acos((sin(alt) - sin(LAT) * sin(sp.decl)) / (cos(LAT) * cos(sp.decl))) / 15;
  const sunset = at(0.833, false);

  const utc: AzanTimes = {
    fajr: at(meth.fajr, true),
    sunrise: at(0.833, true),
    dhuhr: noon + 1 / 60,
    asr,
    maghrib: sunset,
    isha: meth.ishaMin ? sunset + meth.ishaMin / 60 : at(meth.isha ?? 17, false),
  };
  const off = tzOffsetMin(y, m, d);
  const out = {} as AzanTimes;
  (Object.keys(utc) as (keyof AzanTimes)[]).forEach((k) => {
    out[k] = Math.round(utc[k] * 60 + off);
  });
  return out;
}

export function iqamahFor(rule: IqamahRule, azan: number): number {
  if (rule.mode === "fixed") return parseHM(rule.time);
  return Math.ceil((azan + (Number(rule.offset) || 0)) / 5) * 5; // up to the next 5 minutes
}

export function activeRamadan(date: string, list: Ramadan[]): Ramadan | null {
  return list.find((r) => date >= r.start_date && date <= r.end_date) ?? null;
}

export type BoardRow = {
  key: PrayerKey | "sunrise" | "taraweeh";
  name: string;
  azan: number | null;
  iqamah: number | null;
  ramadan: boolean;
};

/** One day: the given Azan times, the Iqamah rules, and Ramadan (if the day falls inside it). */
export function dayBoard(az: AzanTimes, rules: IqamahRules, ram: Ramadan | null): { rows: BoardRow[]; ramadan: Ramadan | null } {
  const rows: BoardRow[] = [];
  for (const [key, name] of PRAYERS) {
    const isIshaRamadan = key === "isha" && ram;
    rows.push({
      key,
      name,
      azan: az[key],
      iqamah: isIshaRamadan ? parseHM(ram.isha_iqamah) : iqamahFor(rules[key], az[key]),
      ramadan: Boolean(isIshaRamadan),
    });
    if (key === "fajr") rows.push({ key: "sunrise", name: "Sunrise", azan: az.sunrise, iqamah: null, ramadan: false });
  }
  if (ram) rows.push({ key: "taraweeh", name: "Taraweeh", azan: null, iqamah: parseHM(ram.taraweeh), ramadan: true });
  return { rows, ramadan: ram };
}

/* ---------- Jumu'ah seasons: repeat every year and may cross New Year ---------- */
export function seasonHas(s: Season, month: number, day: number): boolean {
  const k = month * 100 + day;
  const a = s.start_month * 100 + s.start_day;
  const b = s.end_month * 100 + s.end_day;
  return a <= b ? k >= a && k <= b : k >= a || k <= b;
}
export function seasonsOn(date: string, list: Season[]): Season[] {
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  return list.filter((s) => seasonHas(s, m, d));
}
export function jumuahOn(date: string, list: Season[]): Season | null {
  return seasonsOn(date, list)[0] ?? null;
}

const MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MAX_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Finds days of the year (leap year, so 29 Feb counts) with no season or with more than one. */
export function seasonCoverage(list: Season[]): { gaps: string[]; overlaps: string[]; ok: boolean } {
  const gaps: string[] = [];
  const overlaps: string[] = [];
  let start: string | null = null;
  let kind: "gap" | "overlap" | null = null;
  let last = "";
  const flush = () => {
    if (start && kind) (kind === "gap" ? gaps : overlaps).push(start === last ? start : `${start} to ${last}`);
    start = null;
  };
  const base = Date.UTC(2028, 0, 1);
  for (let i = 0; i < 366; i++) {
    const dt = new Date(base + i * 86400000);
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    const n = list.filter((s) => seasonHas(s, m, d)).length;
    const label = `${d} ${MON3[m - 1]}`;
    const type = n === 0 ? "gap" : n > 1 ? "overlap" : null;
    if (type !== kind) {
      flush();
      kind = type;
      if (type) start = label;
    }
    last = label;
  }
  flush();
  return { gaps, overlaps, ok: !gaps.length && !overlaps.length };
}

export const seasonRangeText = (s: Season) =>
  `${s.start_day} ${MON3[s.start_month - 1]} to ${s.end_day} ${MON3[s.end_month - 1]}`;

/* ---------- Australian phone numbers ---------- */
export function normalisePhone(raw: string): { value: string; fixedZero: boolean; ok: boolean } {
  let s = raw.replace(/[^\d+]/g, "");
  let fixedZero = false;
  if (/^\+610/.test(s)) {
    s = "+61" + s.slice(4);
    fixedZero = true;
  }
  return { value: s, fixedZero, ok: /^\+61[2-478]\d{8}$/.test(s) };
}
export function prettyPhone(s: string): string {
  const mobile = /^\+61(4\d{2})(\d{3})(\d{3})$/.exec(s);
  if (mobile) return `+61 ${mobile[1]} ${mobile[2]} ${mobile[3]}`;
  const other = /^\+61(\d)(\d{4})(\d{4})$/.exec(s);
  if (other) return `+61 ${other[1]} ${other[2]} ${other[3]}`;
  return s;
}
