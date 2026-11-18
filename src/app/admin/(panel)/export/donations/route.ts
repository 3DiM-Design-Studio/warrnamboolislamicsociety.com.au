import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  COLOR,
  DATE_FORMAT,
  FONT,
  MONEY_FORMAT,
  addBanner,
  asDate,
  bodyCell,
  monthName,
  newWorkbook,
  noteRow,
  prettyDay,
  printSetup,
  safeText,
  sectionTitle,
  statTile,
  tableHeader,
  xlsxResponse,
} from "@/lib/excel-report";
import { melbourneToday } from "@/lib/prayer";

// The donations report: /admin/export/donations?month=2026-11  (or month=all for every donation).
// Only signed-in admins can open it, because the first thing it does is check the login.

type Row = {
  submitted_date: string;
  donor_name: string;
  anonymous: boolean;
  email: string;
  phone: string;
  amount_cents: number;
  frequency: "once" | "monthly";
  wants_receipt: boolean;
  dedication: string;
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const addMonths = (key: string, n: number) => {
  const d = new Date(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export async function GET(request: NextRequest) {
  const { supabase } = await requireAdmin();
  const today = melbourneToday();
  const asked = request.nextUrl.searchParams.get("month") ?? today.slice(0, 7);
  const all = asked === "all";
  const month = !all && MONTH.test(asked) ? asked : today.slice(0, 7);

  // The donations in the period, plus the six months up to it (for the trend) in one go.
  const trendStart = `${addMonths(month, -5)}-01`;
  let query = supabase
    .from("donations")
    .select("submitted_date,donor_name,anonymous,email,phone,amount_cents,frequency,wants_receipt,dedication")
    .order("submitted_date", { ascending: true })
    .limit(20000);
  if (!all) query = query.gte("submitted_date", trendStart).lt("submitted_date", `${addMonths(month, 1)}-01`);
  const { data, error } = await query;
  if (error) return new Response("The donations could not be loaded. Please try again in a moment.", { status: 500 });

  const everything = (data ?? []) as Row[];
  const rows = all ? everything : everything.filter((r) => r.submitted_date.startsWith(month));
  const label = all ? "All donations" : monthName(month);

  const totalCents = rows.reduce((s, r) => s + r.amount_cents, 0);
  const count = rows.length;
  const largest = rows.reduce((m, r) => Math.max(m, r.amount_cents), 0);
  const group = (f: "once" | "monthly") => {
    const g = rows.filter((r) => r.frequency === f);
    return { count: g.length, cents: g.reduce((s, r) => s + r.amount_cents, 0) };
  };
  const once = group("once");
  const monthly = group("monthly");
  const anonymousCount = rows.filter((r) => r.anonymous).length;

  const wb = newWorkbook(`Donations report, ${label}`);

  /* ---------------- Summary ---------------- */
  const sum = wb.addWorksheet("Summary", { properties: { tabColor: { argb: COLOR.green } } });
  sum.columns = [{ width: 11 }, { width: 22 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];
  let r = await addBanner(wb, sum, 7, `Donations report · ${label}`);

  sum.mergeCells(r, 1, r, 7);
  const meta = sum.getCell(r, 1);
  meta.value = `Prepared on ${prettyDay()}. Amounts are in Australian dollars (AUD).`;
  meta.font = { name: FONT, size: 10, italic: true, color: { argb: COLOR.muted } };
  meta.alignment = { indent: 1 };
  r += 2;

  statTile(sum, r, 1, 3, "Total received", totalCents / 100, MONEY_FORMAT);
  statTile(sum, r, 4, 2, "Donations", count);
  statTile(sum, r, 6, 2, "Average gift", count ? totalCents / 100 / count : 0, MONEY_FORMAT);
  r += 3;
  statTile(sum, r, 1, 3, "Largest single gift", largest / 100, MONEY_FORMAT);
  statTile(sum, r, 4, 2, "Monthly givers", monthly.count);
  statTile(sum, r, 6, 2, "Anonymous gifts", anonymousCount);
  r += 3;

  if (!all) {
    const prevKey = addMonths(month, -1);
    const prevCents = everything.filter((x) => x.submitted_date.startsWith(prevKey)).reduce((s, x) => s + x.amount_cents, 0);
    sum.mergeCells(r, 1, r, 7);
    const cmp = sum.getCell(r, 1);
    cmp.value =
      prevCents > 0
        ? `${totalCents >= prevCents ? "Up" : "Down"} ${Math.round((Math.abs(totalCents - prevCents) / prevCents) * 100)}% compared with ${monthName(prevKey)}.`
        : count > 0
          ? `No donations were recorded in ${monthName(prevKey)}.`
          : "";
    cmp.font = { name: FONT, size: 11, bold: true, color: { argb: COLOR.greenDeep } };
    cmp.alignment = { indent: 1 };
    r += 2;
  }

  sectionTitle(sum, r, 1, 7, "How people gave");
  r += 1;
  tableHeader(sum, r, 1, ["Type", "", "Gifts", "Total", "", "Share", ""], ["left", "left", "right", "right", "right", "right", "right"]);
  sum.mergeCells(r, 1, r, 2);
  sum.mergeCells(r, 4, r, 5);
  sum.mergeCells(r, 6, r, 7);
  r += 1;
  [
    ["One-time gifts", once],
    ["Monthly gifts", monthly],
  ].forEach(([name, g], i) => {
    const gg = g as { count: number; cents: number };
    sum.mergeCells(r, 1, r, 2);
    sum.mergeCells(r, 4, r, 5);
    sum.mergeCells(r, 6, r, 7);
    sum.getCell(r, 1).value = name as string;
    sum.getCell(r, 3).value = gg.count;
    sum.getCell(r, 4).value = gg.cents / 100;
    sum.getCell(r, 4).numFmt = MONEY_FORMAT;
    sum.getCell(r, 6).value = totalCents ? gg.cents / totalCents : 0;
    sum.getCell(r, 6).numFmt = "0%";
    for (let c = 1; c <= 7; c++) bodyCell(sum.getCell(r, c), i, c === 1 || c === 2 ? "left" : "right");
    sum.getRow(r).height = 22;
    r += 1;
  });
  r += 1;

  if (!all) {
    sectionTitle(sum, r, 1, 7, "Last six months");
    r += 1;
    const keys = Array.from({ length: 6 }, (_, i) => addMonths(month, i - 5));
    const sums = keys.map((k) => everything.filter((x) => x.submitted_date.startsWith(k)).reduce((s, x) => s + x.amount_cents, 0));
    const max = Math.max(1, ...sums);
    tableHeader(sum, r, 1, ["", "Month", "Total", "", "", "", ""], ["left", "left", "right", "left", "left", "left", "left"]);
    sum.mergeCells(r, 1, r, 2);
    sum.getCell(r, 1).value = "Month";
    sum.getCell(r, 3).value = "Total";
    sum.mergeCells(r, 4, r, 7);
    sum.getCell(r, 4).value = "";
    r += 1;
    keys.forEach((k, i) => {
      sum.mergeCells(r, 1, r, 2);
      sum.getCell(r, 1).value = monthName(k);
      sum.getCell(r, 3).value = sums[i] / 100;
      sum.getCell(r, 3).numFmt = MONEY_FORMAT;
      sum.mergeCells(r, 4, r, 7);
      sum.getCell(r, 4).value = "█".repeat(Math.round((sums[i] / max) * 24));
      for (let c = 1; c <= 7; c++) bodyCell(sum.getCell(r, c), i, c === 3 ? "right" : "left");
      sum.getRow(r).height = 22;
      sum.getCell(r, 4).font = { name: FONT, size: 11, color: { argb: k === month ? COLOR.green : COLOR.lime } };
      r += 1;
    });
    r += 1;
  }

  noteRow(sum, r, 1, 7, "JazakAllahu khayran to everyone who gave. This page has no personal details, so it can be shared with the community.", { height: 32 });
  printSetup(sum);

  /* ---------------- Donations list ---------------- */
  const list = wb.addWorksheet("Donations", { properties: { tabColor: { argb: COLOR.lime } } });
  list.columns = [{ width: 15 }, { width: 34 }, { width: 14 }, { width: 16 }, { width: 44 }];
  let lr = await addBanner(wb, list, 5, `Every donation · ${label}`);
  tableHeader(list, lr, 1, ["Date", "Donor", "Type", "Amount", "Dedication"], ["left", "left", "left", "right", "left"]);
  const headerRow = lr;
  lr += 1;
  rows.forEach((d, i) => {
    const cells = [list.getCell(lr, 1), list.getCell(lr, 2), list.getCell(lr, 3), list.getCell(lr, 4), list.getCell(lr, 5)];
    cells[0].value = asDate(d.submitted_date);
    cells[0].numFmt = DATE_FORMAT;
    cells[1].value = d.anonymous ? "Anonymous" : safeText(d.donor_name || "Name not given");
    cells[2].value = d.frequency === "monthly" ? "Monthly" : "One-time";
    cells[3].value = d.amount_cents / 100;
    cells[3].numFmt = MONEY_FORMAT;
    cells[4].value = safeText(d.dedication ?? "");
    cells.forEach((c, k) => bodyCell(c, i, k === 3 ? "right" : "left"));
    cells[4].alignment = { vertical: "middle", wrapText: true, indent: 1 };
    list.getRow(lr).height = 22;
    lr += 1;
  });
  if (rows.length === 0) {
    noteRow(list, lr, 1, 5, "No donations in this period.", { height: 26 });
  } else {
    list.mergeCells(lr, 1, lr, 3);
    const t = list.getCell(lr, 1);
    t.value = "Total";
    const total = list.getCell(lr, 4);
    total.value = { formula: `SUM(D${headerRow + 1}:D${lr - 1})`, result: totalCents / 100 };
    total.numFmt = MONEY_FORMAT;
    for (let c = 1; c <= 5; c++) {
      const cell = list.getCell(lr, c);
      cell.font = { name: FONT, size: 12, bold: true, color: { argb: COLOR.dark } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.soft } };
      cell.border = { top: { style: "medium", color: { argb: COLOR.green } } };
      cell.alignment = { vertical: "middle", horizontal: c === 4 ? "right" : "left", indent: c === 4 ? 0 : 1 };
    }
    list.getRow(lr).height = 26;
    list.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: headerRow, column: 5 } };
  }
  list.views = [{ state: "frozen", ySplit: headerRow, showGridLines: false }];
  list.pageSetup.printTitlesRow = `${headerRow}:${headerRow}`;
  printSetup(list, true);
  list.pageSetup.printTitlesRow = `${headerRow}:${headerRow}`;

  /* ---------------- Private details ---------------- */
  const priv = wb.addWorksheet("Private details", { properties: { tabColor: { argb: COLOR.warn } } });
  priv.columns = [{ width: 15 }, { width: 28 }, { width: 34 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }];
  let pr = await addBanner(wb, priv, 7, `Donor contact details · ${label}`);
  noteRow(priv, pr, 1, 7, "PRIVATE. For the treasurer and committee only. Please do not share this sheet or post it online.", { warn: true, height: 28 });
  pr += 2;
  tableHeader(priv, pr, 1, ["Date", "Donor", "Email", "Phone", "Amount", "Type", "Receipt"], ["left", "left", "left", "left", "right", "left", "left"]);
  const privHeader = pr;
  pr += 1;
  rows.forEach((d, i) => {
    const cells = Array.from({ length: 7 }, (_, k) => priv.getCell(pr, k + 1));
    cells[0].value = asDate(d.submitted_date);
    cells[0].numFmt = DATE_FORMAT;
    cells[1].value = safeText(`${d.donor_name || "Name not given"}${d.anonymous ? " (asked to be anonymous)" : ""}`);
    cells[2].value = safeText(d.email ?? "");
    cells[3].value = safeText(d.phone ?? "");
    cells[4].value = d.amount_cents / 100;
    cells[4].numFmt = MONEY_FORMAT;
    cells[5].value = d.frequency === "monthly" ? "Monthly" : "One-time";
    cells[6].value = d.wants_receipt ? "Wanted" : "Not wanted";
    cells.forEach((c, k) => bodyCell(c, i, k === 4 ? "right" : "left"));
    priv.getRow(pr).height = 22;
    pr += 1;
  });
  priv.views = [{ state: "frozen", ySplit: privHeader, showGridLines: false }];
  if (rows.length > 0) priv.autoFilter = { from: { row: privHeader, column: 1 }, to: { row: privHeader, column: 7 } };
  printSetup(priv, true);

  const file = all ? "WIS-Donations-all-time.xlsx" : `WIS-Donations-${monthName(month).replace(" ", "-")}.xlsx`;
  return xlsxResponse(wb, file);
}
