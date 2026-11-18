import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { COLOR, DATE_FORMAT, FONT, addBanner, asDate, bodyCell, newWorkbook, noteRow, prettyDay, printSetup, safeText, sectionTitle, statTile, tableHeader, xlsxResponse } from "@/lib/excel-report";
import { melbourneToday } from "@/lib/prayer";

// The newsletter list: /admin/export/newsletter?status=all|subscribed|unsubscribed
// Only signed-in admins can open it, because the first thing it does is check the login.

type Row = { email: string; status: "subscribed" | "unsubscribed"; subscribed_date: string };

export async function GET(request: NextRequest) {
  const { supabase } = await requireAdmin();
  const asked = request.nextUrl.searchParams.get("status");
  const status = asked === "subscribed" || asked === "unsubscribed" ? asked : "all";

  const { data, error } = await supabase.from("subscribers").select("email,status,subscribed_date").order("subscribed_date", { ascending: false }).limit(50000);
  if (error) return new Response("The newsletter list could not be loaded. Please try again in a moment.", { status: 500 });

  const everyone = (data ?? []) as Row[];
  const rows = status === "all" ? everyone : everyone.filter((s) => s.status === status);
  const subscribed = everyone.filter((s) => s.status === "subscribed").length;
  const monthStart = `${melbourneToday().slice(0, 7)}-01`;
  const newThisMonth = everyone.filter((s) => s.status === "subscribed" && s.subscribed_date >= monthStart).length;
  const which = status === "subscribed" ? "People getting updates" : status === "unsubscribed" ? "People who unsubscribed" : "Everyone on the list";

  const wb = newWorkbook("Newsletter list");

  /* ---------------- Summary ---------------- */
  const sum = wb.addWorksheet("Summary", { properties: { tabColor: { argb: COLOR.green } } });
  sum.columns = [{ width: 11 }, { width: 22 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];
  let r = await addBanner(wb, sum, 7, "Newsletter subscribers");
  sum.mergeCells(r, 1, r, 7);
  const meta = sum.getCell(r, 1);
  meta.value = `Prepared on ${prettyDay()}.`;
  meta.font = { name: FONT, size: 10, italic: true, color: { argb: COLOR.muted } };
  meta.alignment = { indent: 1 };
  r += 2;
  statTile(sum, r, 1, 3, "People getting updates", subscribed);
  statTile(sum, r, 4, 2, "Joined this month", newThisMonth);
  statTile(sum, r, 6, 2, "Unsubscribed", everyone.length - subscribed);
  r += 3;
  noteRow(sum, r, 1, 7, "Email addresses are private. Please do not share the Subscribers sheet outside the committee.", { warn: true, height: 28 });
  printSetup(sum);

  /* ---------------- Subscribers ---------------- */
  const list = wb.addWorksheet("Subscribers", { properties: { tabColor: { argb: COLOR.lime } } });
  list.columns = [{ width: 46 }, { width: 18 }, { width: 16 }];
  let lr = await addBanner(wb, list, 3, which);
  sectionTitle(list, lr, 1, 3, `${rows.length} ${rows.length === 1 ? "email" : "emails"}`);
  lr += 1;
  tableHeader(list, lr, 1, ["Email", "Status", "Signed up"]);
  const header = lr;
  lr += 1;
  rows.forEach((s, i) => {
    const cells = [list.getCell(lr, 1), list.getCell(lr, 2), list.getCell(lr, 3)];
    cells[0].value = safeText(s.email);
    cells[1].value = s.status === "subscribed" ? "Subscribed" : "Unsubscribed";
    cells[2].value = asDate(s.subscribed_date);
    cells[2].numFmt = DATE_FORMAT;
    cells.forEach((c) => bodyCell(c, i));
    list.getRow(lr).height = 22;
    cells[1].font = { name: FONT, size: 11, bold: true, color: { argb: s.status === "subscribed" ? COLOR.greenDeep : COLOR.muted } };
    lr += 1;
  });
  if (rows.length === 0) noteRow(list, lr, 1, 3, "Nobody on the list yet.", { height: 26 });
  else list.autoFilter = { from: { row: header, column: 1 }, to: { row: header, column: 3 } };
  list.views = [{ state: "frozen", ySplit: header, showGridLines: false }];
  printSetup(list);
  list.pageSetup.printTitlesRow = `${header}:${header}`;

  return xlsxResponse(wb, "WIS-Newsletter-list.xlsx");
}
