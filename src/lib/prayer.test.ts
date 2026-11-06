import { describe, expect, test } from "bun:test";
import {
  DEFAULT_RULES,
  azanTimes,
  dayBoard,
  fmtTime,
  iqamahFor,
  jumuahOn,
  normalisePhone,
  prettyPhone,
  seasonCoverage,
  seasonsOn,
  type Season,
} from "./prayer";

const cfg = { method: "mwl" as const, asr: "standard" as const, rules: DEFAULT_RULES };
const season = (name: string, sm: number, sd: number, em: number, ed: number, time: string): Season => ({
  name,
  start_month: sm,
  start_day: sd,
  end_month: em,
  end_day: ed,
  jumuah_time: time,
});

describe("Azan for Warrnambool", () => {
  test("times follow the right order through the day", () => {
    for (const d of ["2026-01-15", "2026-04-05", "2026-06-21", "2026-09-30", "2026-11-05", "2026-12-21"]) {
      const t = azanTimes(d, cfg);
      expect(t.fajr).toBeLessThan(t.sunrise);
      expect(t.sunrise).toBeLessThan(t.dhuhr);
      expect(t.dhuhr).toBeLessThan(t.asr);
      expect(t.asr).toBeLessThan(t.maghrib);
      expect(t.maghrib).toBeLessThan(t.isha);
    }
  });

  test("early November (daylight saving) is in a believable range", () => {
    const t = azanTimes("2026-11-05", cfg);
    expect(t.sunrise).toBeGreaterThan(5 * 60 + 45);
    expect(t.sunrise).toBeLessThan(6 * 60 + 30);
    expect(t.maghrib).toBeGreaterThan(20 * 60);
    expect(t.maghrib).toBeLessThan(20 * 60 + 25);
  });

  test("winter is much shorter than summer", () => {
    const winter = azanTimes("2026-06-21", cfg);
    const summer = azanTimes("2026-12-21", cfg);
    expect(winter.maghrib - winter.sunrise).toBeLessThan(10 * 60);
    expect(summer.maghrib - summer.sunrise).toBeGreaterThan(14 * 60);
  });

  test("clocks go forward by one hour when daylight saving starts (Sunday 4 Oct 2026)", () => {
    const before = azanTimes("2026-10-03", cfg).dhuhr;
    const after = azanTimes("2026-10-04", cfg).dhuhr;
    expect(after - before).toBeGreaterThan(55);
    expect(after - before).toBeLessThan(66);
  });

  test("clocks go back by one hour when daylight saving ends (Sunday 5 Apr 2026)", () => {
    const before = azanTimes("2026-04-04", cfg).dhuhr;
    const after = azanTimes("2026-04-05", cfg).dhuhr;
    expect(before - after).toBeGreaterThan(55);
    expect(before - after).toBeLessThan(66);
  });

  test("Hanafi Asr is later than standard Asr", () => {
    expect(azanTimes("2026-11-05", { ...cfg, asr: "hanafi" }).asr).toBeGreaterThan(azanTimes("2026-11-05", cfg).asr);
  });

  test("a stricter Fajr angle gives an earlier Fajr", () => {
    expect(azanTimes("2026-11-05", { ...cfg, method: "egypt" }).fajr).toBeLessThan(azanTimes("2026-11-05", { ...cfg, method: "isna" }).fajr);
  });
});

describe("Iqamah", () => {
  test("minutes after Azan round up to the next 5 minutes", () => {
    expect(iqamahFor({ mode: "offset", offset: 15, time: "00:00" }, 16 * 60 + 41)).toBe(17 * 60); // 4:56 PM -> 5:00 PM
    expect(iqamahFor({ mode: "offset", offset: 5, time: "00:00" }, 20 * 60 + 11)).toBe(20 * 60 + 20);
  });
  test("a fixed time ignores Azan", () => {
    expect(iqamahFor({ mode: "fixed", offset: 99, time: "13:15" }, 12 * 60)).toBe(13 * 60 + 15);
  });
  test("Ramadan replaces Isha and adds Taraweeh only inside its dates", () => {
    const ram = [{ name: "Ramadan", start_date: "2027-02-08", end_date: "2027-03-09", isha_iqamah: "21:15", taraweeh: "21:45" }];
    const inside = dayBoard("2027-02-20", cfg, ram);
    expect(inside.rows.find((r) => r.key === "isha")?.iqamah).toBe(21 * 60 + 15);
    expect(inside.rows.find((r) => r.key === "taraweeh")?.iqamah).toBe(21 * 60 + 45);
    const outside = dayBoard("2027-03-10", cfg, ram);
    expect(outside.rows.find((r) => r.key === "taraweeh")).toBeUndefined();
    expect(outside.rows.find((r) => r.key === "isha")?.ramadan).toBe(false);
  });
  test("time text", () => {
    expect(fmtTime(0)).toBe("12:00 AM");
    expect(fmtTime(12 * 60 + 30)).toBe("12:30 PM");
    expect(fmtTime(13 * 60 + 30)).toBe("1:30 PM");
  });
});

describe("Jumu'ah seasons", () => {
  const autumnWinter = season("Autumn and winter", 3, 1, 8, 31, "12:30");
  const springSummer = season("Spring and summer", 9, 1, 2, 29, "13:30");

  test("a season can run over New Year", () => {
    const list = [autumnWinter, springSummer];
    expect(jumuahOn("2026-12-25", list)?.jumuah_time).toBe("13:30");
    expect(jumuahOn("2027-01-15", list)?.jumuah_time).toBe("13:30");
    expect(jumuahOn("2027-02-28", list)?.jumuah_time).toBe("13:30");
    expect(jumuahOn("2027-03-01", list)?.jumuah_time).toBe("12:30");
  });

  test("the time switches exactly on the boundary days", () => {
    const list = [autumnWinter, springSummer];
    expect(jumuahOn("2026-08-31", list)?.jumuah_time).toBe("12:30");
    expect(jumuahOn("2026-09-01", list)?.jumuah_time).toBe("13:30");
  });

  test("two seasons that cover the whole year, including 29 February, pass the year check", () => {
    expect(seasonCoverage([autumnWinter, springSummer]).ok).toBe(true);
  });

  test("a season ending 28 Feb leaves a gap on 29 Feb in a leap year", () => {
    const c = seasonCoverage([autumnWinter, season("Spring and summer", 9, 1, 2, 28, "13:30")]);
    expect(c.ok).toBe(false);
    expect(c.gaps).toEqual(["29 Feb"]);
  });

  test("overlapping seasons are reported", () => {
    const c = seasonCoverage([season("A", 1, 1, 7, 15, "12:30"), season("B", 7, 1, 12, 31, "13:30")]);
    expect(c.overlaps).toEqual(["1 Jul to 15 Jul"]);
  });

  test("no seasons means the whole year is a gap and no time is shown", () => {
    expect(seasonCoverage([]).ok).toBe(false);
    expect(jumuahOn("2026-11-05", [])).toBeNull();
  });

  test("one all-year season always applies", () => {
    const all = [season("All year", 1, 1, 12, 31, "12:30")];
    expect(seasonCoverage(all).ok).toBe(true);
    expect(seasonsOn("2028-02-29", all)).toHaveLength(1);
  });
});

describe("Phone numbers", () => {
  test("removes the extra 0 after +61", () => {
    const n = normalisePhone("+61 0359 071 724");
    expect(n.fixedZero).toBe(true);
    expect(n.ok).toBe(true);
    expect(prettyPhone(n.value)).toBe("+61 3 5907 1724");
  });
  test("mobile numbers", () => {
    expect(prettyPhone(normalisePhone("+61 493 187 858").value)).toBe("+61 493 187 858");
    expect(normalisePhone("+61 0412 345 678").value).toBe("+61412345678");
  });
  test("rejects numbers that are not Australian", () => {
    expect(normalisePhone("0412 345 678").ok).toBe(false);
    expect(normalisePhone("+1 555 0100").ok).toBe(false);
    expect(normalisePhone("hello").ok).toBe(false);
  });
});
