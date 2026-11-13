"use client";

import { useState } from "react";
import { deleteDonation } from "@/lib/actions/donations";
import type { DonationRow } from "@/lib/types";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Pager, SearchBox, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, useRunAction } from "@/components/admin/ui";

const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);

type Sort = "newest" | "oldest" | "biggest" | "name";

// A cell that starts with = + - or @ could run as a formula in Excel, so it gets a leading '.
const cell = (v: string | number) => {
  const s = String(v);
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

function downloadCsv(rows: DonationRow[]) {
  const head = ["Date", "Name", "Anonymous", "Email", "Phone", "Amount (AUD)", "Type", "Receipt wanted", "Dedication"];
  const lines = rows.map((d) =>
    [
      d.submitted_date,
      d.donor_name,
      d.anonymous ? "Yes" : "No",
      d.email,
      d.phone,
      (d.amount_cents / 100).toFixed(2),
      d.frequency === "monthly" ? "Monthly" : "Once",
      d.wants_receipt ? "Yes" : "No",
      d.dedication,
    ]
      .map(cell)
      .join(","),
  );
  const blob = new Blob(["﻿" + [head.map(cell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "donations.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="grid gap-1">
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className="text-3xl font-bold leading-tight tracking-tight tabular-nums">{value}</div>
      <div className="text-sm text-muted">{sub}</div>
    </Card>
  );
}

export function DonationsManager({ donations, month }: { donations: DonationRow[]; month: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "once" | "monthly">("all");
  const [anon, setAnon] = useState<"all" | "anonymous" | "named">("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<DonationRow | null>(null);
  const [deleting, setDeleting] = useState<DonationRow | null>(null);
  const { run, pending } = useRunAction();

  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const total = donations.reduce((n, d) => n + d.amount_cents, 0);
  const thisMonth = donations.filter((d) => d.submitted_date.startsWith(month)).reduce((n, d) => n + d.amount_cents, 0);
  const monthlyGivers = new Set(donations.filter((d) => d.frequency === "monthly").map((d) => d.email.toLowerCase())).size;

  const shown = donations
    .filter(
      (d) =>
        (type === "all" || d.frequency === type) &&
        (anon === "all" || (anon === "anonymous") === d.anonymous) &&
        matchesSearch(query, d.donor_name, d.email, d.phone, d.dedication),
    )
    .sort((a, b) => {
      if (sort === "oldest") return a.submitted_date.localeCompare(b.submitted_date);
      if (sort === "biggest") return b.amount_cents - a.amount_cents;
      if (sort === "name") return a.donor_name.localeCompare(b.donor_name);
      return b.submitted_date.localeCompare(a.submitted_date);
    });
  const pg = paginate(shown, page);
  const filtering = query !== "" || type !== "all" || anon !== "all";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total donated" value={money(total)} sub="All time" />
        <Stat label="This month" value={money(thisMonth)} sub="Donations received this month" />
        <Stat label="Donations" value={String(donations.length)} sub="Payments received" />
        <Stat label="Monthly givers" value={String(monthlyGivers)} sub="People giving every month" />
      </div>

      <Card>
        <CardHead title="All donations">
          {donations.length > 0 && (
            <Button small onClick={() => downloadCsv(shown)}>
              Download spreadsheet
            </Button>
          )}
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">Donations made on the website&rsquo;s Donate page appear here.</p>

        {donations.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search donations" />
            <select aria-label="Once or monthly" value={type} onChange={(e) => change(() => setType(e.target.value as typeof type))} className={filterClass}>
              <option value="all">Once &amp; monthly</option>
              <option value="once">Once only</option>
              <option value="monthly">Monthly only</option>
            </select>
            <select aria-label="Anonymous" value={anon} onChange={(e) => change(() => setAnon(e.target.value as typeof anon))} className={filterClass}>
              <option value="all">Named &amp; anonymous</option>
              <option value="named">Named only</option>
              <option value="anonymous">Anonymous only</option>
            </select>
            <select aria-label="Sort donations" value={sort} onChange={(e) => change(() => setSort(e.target.value as Sort))} className={filterClass}>
              <option value="newest">Sort: Newest first</option>
              <option value="oldest">Sort: Oldest first</option>
              <option value="biggest">Sort: Biggest amount</option>
              <option value="name">Sort: Name A&ndash;Z</option>
            </select>
            {filtering && (
              <Button
                small
                onClick={() =>
                  change(() => {
                    setQuery("");
                    setType("all");
                    setAnon("all");
                  })
                }
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {donations.length === 0 ? (
          <EmptyNote>No donations yet. When someone donates on the Donate page, it shows up here.</EmptyNote>
        ) : shown.length === 0 ? (
          <EmptyNote>No donations match. Try a different search or press &ldquo;Clear filters&rdquo;.</EmptyNote>
        ) : (
          <>
            <List>
              {pg.rows.map((d) => (
                <Row
                  key={d.id}
                  lead={
                    <span className="flex items-center gap-3.5">
                      <Avatar name={d.anonymous ? "Anonymous" : d.donor_name || d.email} round />
                      <span className="font-semibold">
                        {d.anonymous ? "Anonymous" : d.donor_name || d.email}{" "}
                        <Badge tone={d.frequency === "monthly" ? "gold" : "green"}>{d.frequency === "monthly" ? "Monthly" : "Once"}</Badge>
                      </span>
                    </span>
                  }
                  actions={
                    <>
                      <span className="mr-2 text-lg font-bold tabular-nums">{money(d.amount_cents)}</span>
                      <Button small variant="primary" onClick={() => setViewing(d)}>
                        View
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(d)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <span className="pl-[58px] max-sm:pl-0">
                    {fmtDate(d.submitted_date)}
                    {d.dedication && <> &middot; {d.dedication}</>}
                  </span>
                </Row>
              ))}
            </List>
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={viewing !== null} onClose={() => setViewing(null)} title="Donation details">
        {viewing && (
          <div className="grid gap-3 text-sm">
            {viewing.anonymous && (
              <p className="rounded-xl bg-[#fff4d6] p-3">This donor asked to be anonymous. Please do not share their name publicly.</p>
            )}
            <p className="text-3xl font-bold tabular-nums">
              {money(viewing.amount_cents)} <span className="text-base font-semibold text-muted">{viewing.frequency === "monthly" ? "every month" : "one time"}</span>
            </p>
            <p>
              <span className="font-semibold">Name:</span> {viewing.donor_name || "Not given"}
            </p>
            <p>
              <span className="font-semibold">Email:</span> <span className="select-all break-all">{viewing.email}</span>
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {viewing.phone || "Not given"}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {fmtDate(viewing.submitted_date, true)}
            </p>
            <p>
              <span className="font-semibold">Receipt:</span> {viewing.wants_receipt ? "Wants an email receipt" : "No receipt wanted"}
            </p>
            {viewing.dedication && (
              <p>
                <span className="font-semibold">Dedicated to:</span> {viewing.dedication}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button onClick={() => setViewing(null)}>Close</Button>
              <a
                href={`mailto:${viewing.email}?subject=${encodeURIComponent("Thank you for your donation to Warrnambool Islamic Society")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:brightness-95"
              >
                Email donor
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete this ${money(deleting.amount_cents)} donation from the list? The payment stays in Stripe. This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deleteDonation(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}
