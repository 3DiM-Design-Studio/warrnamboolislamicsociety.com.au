"use client";

import { useMemo, useState } from "react";
import { addMember, deleteMember } from "@/lib/actions/members";
import type { MemberRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, TextField, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

const PAGE_SIZE = 10;

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A–Z)",
  suburb: "Suburb (A–Z)",
} as const;
type SortKey = keyof typeof SORTS;

const fullName = (m: MemberRow) => `${m.first_name} ${m.last_name}`.trim();
const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Number of single-letter changes between two words.
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

// Spelling mistakes count as the same suburb: "Warnambool", "WARRNAMBOOL " and "Warrnamboll" all
// become the most common spelling. Maps each typed spelling to the one it belongs to.
function suburbGroups(members: MemberRow[]) {
  const counts = new Map<string, number>();
  for (const m of members) {
    const k = norm(m.suburb);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const groups = new Map<string, string>();
  const heads: string[] = [];
  for (const [k] of [...counts].sort((a, b) => b[1] - a[1])) {
    const limit = k.length >= 10 ? 2 : k.length >= 5 ? 1 : 0;
    const head = heads.find((h) => distance(h, k) <= limit);
    if (head) groups.set(k, head);
    else {
      heads.push(k);
      groups.set(k, k);
    }
  }
  return groups;
}

export function MembersManager({ members }: { members: MemberRow[] }) {
  const [suburb, setSuburb] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<MemberRow | null>(null);
  const { run, pending } = useRunAction();

  const groups = useMemo(() => suburbGroups(members), [members]);
  const suburbOf = (m: MemberRow) => groups.get(norm(m.suburb)) ?? "";

  const suburbs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of members) {
      const k = groups.get(norm(m.suburb));
      if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b));
  }, [members, groups]);

  const byName = (a: MemberRow, b: MemberRow) => fullName(a).localeCompare(fullName(b));
  const compare: Record<SortKey, (a: MemberRow, b: MemberRow) => number> = {
    newest: (a, b) => b.submitted_date.localeCompare(a.submitted_date) || byName(a, b),
    oldest: (a, b) => a.submitted_date.localeCompare(b.submitted_date) || byName(a, b),
    name: byName,
    // Members with no suburb go last.
    suburb: (a, b) => (suburbOf(a) || "￿").localeCompare(suburbOf(b) || "￿") || byName(a, b),
  };

  const shown = members.filter((m) => !suburb || suburbOf(m) === suburb).sort(compare[sort]);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const first = (current - 1) * PAGE_SIZE;
  const rows = shown.slice(first, first + PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHead title="Members">
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Show members from"
              value={suburb}
              onChange={(e) => {
                setSuburb(e.target.value);
                setPage(1);
              }}
              className={`${inputClass} w-auto! py-2! text-sm font-semibold`}
            >
              <option value="">All suburbs ({members.length})</option>
              {suburbs.map(([k, n]) => (
                <option key={k} value={k}>
                  {titleCase(k)} ({n})
                </option>
              ))}
            </select>
            <select
              aria-label="Sort members by"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
              className={`${inputClass} w-auto! py-2! text-sm font-semibold`}
            >
              {Object.entries(SORTS).map(([k, label]) => (
                <option key={k} value={k}>
                  Sort: {label}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} />
              Add member
            </Button>
          </div>
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">People who join on the website&rsquo;s Membership page show up here straight away.</p>
        {shown.length === 0 ? (
          <EmptyNote>{suburb ? "No members in this suburb." : "No members yet."}</EmptyNote>
        ) : (
          <>
            <List>
              {rows.map((m) => (
                <Row
                  key={m.id}
                  lead={
                    <span className="flex items-center gap-3.5">
                      <Avatar name={fullName(m)} round />
                      <span>{fullName(m)}</span>
                    </span>
                  }
                  actions={
                    <Button small variant="danger" onClick={() => setDeleting(m)}>
                      Delete
                    </Button>
                  }
                >
                  <span className="pl-[58px] max-sm:pl-0">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""} · {fmtDate(m.submitted_date)}
                    {m.amount_cents != null && ` · paid ${(m.amount_cents / 100).toFixed(2)}`}
                  </span>
                  {(m.address || m.suburb || m.postcode) && (
                    <span className="basis-full pl-[58px] max-sm:pl-0">{[m.address, m.suburb, m.postcode].filter(Boolean).join(", ")}</span>
                  )}
                  {(m.spouse || m.children) && (
                    <span className="basis-full pl-[58px] max-sm:pl-0">
                      {m.spouse && `Spouse: ${m.spouse}`}
                      {m.spouse && m.children && " · "}
                      {m.children && `Children: ${m.children}`}
                    </span>
                  )}
                </Row>
              ))}
            </List>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>
                Showing {first + 1}&ndash;{first + rows.length} of {shown.length}
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button small disabled={current === 1} onClick={() => setPage(current - 1)}>
                    Previous
                  </Button>
                  <span className="px-1 font-semibold tabular-nums text-brand-dark">
                    Page {current} of {pages}
                  </span>
                  <Button small disabled={current === pages} onClick={() => setPage(current + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add member">
        {adding && <AddForm onClose={() => setAdding(false)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete ${fullName(deleting)} from the list?` : ""}
        onConfirm={() => deleting && run(() => deleteMember(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function AddForm({ onClose }: { onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(addMember, onClose, { site: false });
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" name="first_name" error={e.first_name} required />
        <TextField label="Last name" name="last_name" error={e.last_name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" name="email" type="email" error={e.email} required />
        <TextField label="Phone (optional)" name="phone" type="tel" error={e.phone} />
      </div>
      <TextField label="Street address (optional)" name="address" error={e.address} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Suburb" name="suburb" error={e.suburb} />
        <TextField label="Postcode" name="postcode" inputMode="numeric" maxLength={4} error={e.postcode} />
      </div>
      <TextField label="Spouse (optional)" name="spouse" error={e.spouse} />
      <TextField label="Children (optional)" name="children" hint="Separate names with a semicolon, like: Ali; Aisha" error={e.children} />
      <ModalActions onCancel={onClose} pending={pending} okLabel="Add" message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
