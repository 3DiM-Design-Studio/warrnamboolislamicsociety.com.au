"use client";

import { useState } from "react";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/actions/subscribers";
import type { SubscriberRow } from "@/lib/types";
import { fmtDate } from "@/components/admin/format";
import { List, Row } from "@/components/admin/list";
import { Pager, SearchBox, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, useRunAction } from "@/components/admin/ui";

// A cell that starts with = + - or @ could run as a formula in Excel, so it gets a leading '.
const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

function downloadCsv(rows: SubscriberRow[]) {
  const lines = [
    ["Email", "Status", "Signed up"].map(cell).join(","),
    ...rows.map((s) => [s.email, s.status === "subscribed" ? "Subscribed" : "Unsubscribed", s.subscribed_date].map(cell).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newsletter-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function SubscribersManager({ subscribers }: { subscribers: SubscriberRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<SubscriberRow | null>(null);
  const { run, pending } = useRunAction();

  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const active = subscribers.filter((s) => s.status === "subscribed").length;
  const shown = subscribers.filter((s) => (status === "all" || s.status === status) && matchesSearch(query, s.email));
  const pg = paginate(shown, page);
  const filtering = query !== "" || status !== "all";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="grid gap-1">
          <div className="text-sm font-semibold text-muted">People getting updates</div>
          <div className="text-3xl font-bold tabular-nums">{active}</div>
        </Card>
        <Card className="grid gap-1">
          <div className="text-sm font-semibold text-muted">Unsubscribed</div>
          <div className="text-3xl font-bold tabular-nums">{subscribers.length - active}</div>
        </Card>
      </div>

      <Card>
        <CardHead title="Newsletter list">
          {subscribers.length > 0 && (
            <Button small onClick={() => downloadCsv(shown)}>
              Download spreadsheet
            </Button>
          )}
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">People who gave their email in the website footer for community updates.</p>

        {subscribers.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search emails" />
            <select aria-label="Show subscribers" value={status} onChange={(e) => change(() => setStatus(e.target.value as typeof status))} className={filterClass}>
              <option value="all">All ({subscribers.length})</option>
              <option value="subscribed">Subscribed ({active})</option>
              <option value="unsubscribed">Unsubscribed ({subscribers.length - active})</option>
            </select>
            {filtering && (
              <Button
                small
                onClick={() =>
                  change(() => {
                    setQuery("");
                    setStatus("all");
                  })
                }
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {subscribers.length === 0 ? (
          <EmptyNote>No one has signed up yet. When someone enters their email in the website footer, it shows up here.</EmptyNote>
        ) : shown.length === 0 ? (
          <EmptyNote>No emails match. Try a different search or press &ldquo;Clear filters&rdquo;.</EmptyNote>
        ) : (
          <>
            <List>
              {pg.rows.map((s) => (
                <Row
                  key={s.id}
                  lead={
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="break-all font-semibold">{s.email}</span>
                      {s.status === "subscribed" ? <Badge tone="green">Subscribed</Badge> : <Badge>Unsubscribed</Badge>}
                    </span>
                  }
                  actions={
                    <>
                      <Button small disabled={pending} onClick={() => run(() => setSubscriberStatus(s.id, s.status !== "subscribed"))}>
                        {s.status === "subscribed" ? "Unsubscribe" : "Subscribe again"}
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(s)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <span>Signed up {fmtDate(s.subscribed_date)}</span>
                </Row>
              ))}
            </List>
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Remove ${deleting.email} from the list? This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deleteSubscriber(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}
