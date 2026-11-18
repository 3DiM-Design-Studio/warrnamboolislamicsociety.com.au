import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import sharp from "sharp";

// Shared look for the spreadsheets the admin panel downloads (donations report, newsletter list).
// Colours are the website's: near-black, lime and green on a soft off-white.

export const COLOR = {
  dark: "FF0B0D0B",
  ink: "FF121512",
  muted: "FF5F655E",
  lime: "FFC9F26B",
  green: "FF00BF2E",
  greenDeep: "FF0F6A4D",
  soft: "FFEAF6DC",
  band: "FFF6F7F2",
  line: "FFE3E4DD",
  white: "FFFFFFFF",
  warnBg: "FFFBE4E1",
  warn: "FFB3261E",
} as const;

export const FONT = "Calibri";
export const MONEY_FORMAT = '"$"#,##0.00';
export const DATE_FORMAT = "d mmm yyyy";

const fill = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const hair: Partial<ExcelJS.Border> = { style: "thin", color: { argb: COLOR.line } };
export const box: Partial<ExcelJS.Borders> = { top: hair, left: hair, bottom: hair, right: hair };

export function newWorkbook(title: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Warrnambool Islamic Society";
  wb.company = "Warrnambool Islamic Society";
  wb.title = title;
  wb.created = new Date();
  return wb;
}

/** The round society logo as a small PNG, or null if it cannot be read (the report still works without it). */
async function logoPng(): Promise<Buffer | null> {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "logo.jpg"));
    const size = 160;
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
    return await sharp(file).resize(size, size).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  } catch {
    return null;
  }
}

/**
 * The top of every sheet: a dark band with the logo, the society name, a subtitle and a lime line.
 * Returns the next free row number.
 */
export async function addBanner(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, lastCol: number, subtitle: string): Promise<number> {
  ws.getRow(1).height = 34;
  ws.getRow(2).height = 24;
  ws.getRow(3).height = 5;
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= lastCol; c++) {
      ws.getCell(r, c).fill = fill(r === 3 ? COLOR.lime : COLOR.dark);
    }
  }
  ws.mergeCells(1, 2, 1, lastCol);
  ws.mergeCells(2, 2, 2, lastCol);
  const title = ws.getCell(1, 2);
  title.value = "Warrnambool Islamic Society";
  title.font = { name: FONT, size: 20, bold: true, color: { argb: COLOR.white } };
  title.alignment = { vertical: "bottom", horizontal: "left", indent: 1 };
  const sub = ws.getCell(2, 2);
  sub.value = subtitle;
  sub.font = { name: FONT, size: 12, color: { argb: COLOR.lime } };
  sub.alignment = { vertical: "top", horizontal: "left", indent: 1 };

  const png = await logoPng();
  if (png) {
    const id = wb.addImage({ base64: png.toString("base64"), extension: "png" });
    ws.addImage(id, { tl: { col: 0.2, row: 0.14 }, ext: { width: 50, height: 50 } });
  }
  return 5;
}

/** Print setup that keeps a sheet on one page width, with the society name and page numbers in the footer. */
export function printSetup(ws: ExcelJS.Worksheet, landscape = false) {
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: landscape ? "landscape" : "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.7, header: 0.3, footer: 0.3 },
    horizontalCentered: true,
  };
  ws.headerFooter = { oddFooter: "&L&8Warrnambool Islamic Society&C&8&A&R&8Page &P of &N" };
  ws.views = [{ showGridLines: false, ...(ws.views?.[0] ?? {}) }];
}

export function sectionTitle(ws: ExcelJS.Worksheet, row: number, firstCol: number, lastCol: number, text: string) {
  ws.mergeCells(row, firstCol, row, lastCol);
  const c = ws.getCell(row, firstCol);
  c.value = text;
  c.font = { name: FONT, size: 13, bold: true, color: { argb: COLOR.dark } };
  c.alignment = { vertical: "middle" };
  ws.getRow(row).height = 24;
  for (let i = firstCol; i <= lastCol; i++) ws.getCell(row, i).border = { bottom: { style: "medium", color: { argb: COLOR.green } } };
}

/** A big number with a small label above it. Spans `width` columns starting at `col`. */
export function statTile(ws: ExcelJS.Worksheet, row: number, col: number, width: number, label: string, value: string | number, format?: string) {
  const last = col + width - 1;
  ws.mergeCells(row, col, row, last);
  ws.mergeCells(row + 1, col, row + 1, last);
  const l = ws.getCell(row, col);
  l.value = label;
  l.font = { name: FONT, size: 10, color: { argb: COLOR.muted } };
  l.alignment = { vertical: "bottom", horizontal: "left", indent: 1 };
  const v = ws.getCell(row + 1, col);
  v.value = value;
  if (format) v.numFmt = format;
  v.font = { name: FONT, size: 20, bold: true, color: { argb: COLOR.greenDeep } };
  v.alignment = { vertical: "top", horizontal: "left", indent: 1 };
  for (let c = col; c <= last; c++) {
    ws.getCell(row, c).fill = fill(COLOR.soft);
    ws.getCell(row + 1, c).fill = fill(COLOR.soft);
  }
  ws.getRow(row).height = 20;
  ws.getRow(row + 1).height = 34;
}

/** A header row for a table: dark with white text. */
export function tableHeader(ws: ExcelJS.Worksheet, row: number, firstCol: number, labels: string[], aligns: ("left" | "right" | "center")[] = []) {
  labels.forEach((text, i) => {
    const c = ws.getCell(row, firstCol + i);
    c.value = text;
    c.font = { name: FONT, size: 11, bold: true, color: { argb: COLOR.white } };
    c.fill = fill(COLOR.dark);
    c.alignment = { vertical: "middle", horizontal: aligns[i] ?? "left", indent: aligns[i] === "right" ? 0 : 1 };
  });
  ws.getRow(row).height = 24;
}

/** Light styling for one table body cell (every second row gets a soft band). */
export function bodyCell(c: ExcelJS.Cell, rowIndex: number, align: "left" | "right" | "center" = "left") {
  c.font = { name: FONT, size: 11, color: { argb: COLOR.ink } };
  c.alignment = { vertical: "middle", horizontal: align, indent: align === "right" ? 0 : 1 };
  c.border = box;
  if (rowIndex % 2 === 1) c.fill = fill(COLOR.band);
}

export function noteRow(ws: ExcelJS.Worksheet, row: number, firstCol: number, lastCol: number, text: string, opts?: { warn?: boolean; height?: number }) {
  ws.mergeCells(row, firstCol, row, lastCol);
  const c = ws.getCell(row, firstCol);
  c.value = text;
  c.font = { name: FONT, size: 10, italic: true, color: { argb: opts?.warn ? COLOR.warn : COLOR.muted } };
  c.alignment = { vertical: "top", wrapText: true, indent: 1 };
  if (opts?.warn) for (let i = firstCol; i <= lastCol; i++) ws.getCell(row, i).fill = fill(COLOR.warnBg);
  ws.getRow(row).height = opts?.height ?? 30;
}

/** Text goes into the file as plain text (never as a formula), so a phone number like +61 4... stays exactly as typed. */
export const safeText = (v: string) => v;

export const asDate = (iso: string) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)));

export const monthName = (key: string) =>
  new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, 1)));

export const prettyDay = (d = new Date()) => new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" }).format(d);

export const xlsxResponse = async (wb: ExcelJS.Workbook, filename: string) => {
  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
};
