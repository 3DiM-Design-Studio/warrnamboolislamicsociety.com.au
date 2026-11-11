"use client";

import { useMemo, useState } from "react";
import { deleteMember, saveMember } from "@/lib/actions/members";
import type { MemberRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Pager, SearchBox, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

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
  const [query, setQuery] = useState("");
  const [suburb, setSuburb] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<MemberRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<MemberRow | null>(null);
  const { run, pending } = useRunAction();

  // Any change to the search or a filter starts again from page 1.
  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

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

  const shown = members
    .filter(
      (m) =>
        (!suburb || suburbOf(m) === suburb) &&
        matchesSearch(query, fullName(m), m.email, m.phone, m.address, m.suburb, m.postcode, m.spouse, m.children),
    )
    .sort(compare[sort]);
  const pg = paginate(shown, page);
  const filtering = query !== "" || suburb !== "";

  return (
    <>
      <Card>
        <CardHead title="Members">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            Add member
          </Button>
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">People who join on the website&rsquo;s Membership page show up here straight away.</p>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search members" />
          <select aria-label="Show members from" value={suburb} onChange={(e) => change(() => setSuburb(e.target.value))} className={filterClass}>
            <option value="">All suburbs ({members.length})</option>
            {suburbs.map(([k, n]) => (
              <option key={k} value={k}>
                {titleCase(k)} ({n})
              </option>
            ))}
          </select>
          <select aria-label="Sort members by" value={sort} onChange={(e) => change(() => setSort(e.target.value as SortKey))} className={filterClass}>
            {Object.entries(SORTS).map(([k, label]) => (
              <option key={k} value={k}>
                Sort: {label}
              </option>
            ))}
          </select>
          {filtering && (
            <Button
              small
              onClick={() =>
                change(() => {
                  setQuery("");
                  setSuburb("");
                })
              }
            >
              Clear filters
            </Button>
          )}
        </div>
        {shown.length === 0 ? (
          <EmptyNote>{filtering ? "No members match. Try a different search or press “Clear filters”." : "No members yet."}</EmptyNote>
        ) : (
          <>
            <List>
              {pg.rows.map((m) => (
                <Row
                  key={m.id}
                  lead={
                    <span className="flex items-center gap-3.5">
                      <Avatar name={fullName(m)} round />
                      <span>{fullName(m)}</span>
                    </span>
                  }
                  actions={
                    <>
                      <Button small onClick={() => setEditing(m)}>
                        Edit
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(m)}>
                        Delete
                      </Button>
                    </>
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
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add member" : "Edit member"}>
        {editing && <MemberForm key={editing === "new" ? "new" : editing.id} member={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
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

function MemberForm({ member, onClose }: { member: MemberRow | null; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveMember, onClose, { site: false });
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" name="first_name" defaultValue={member?.first_name ?? ""} error={e.first_name} required />
        <TextField label="Last name" name="last_name" defaultValue={member?.last_name ?? ""} error={e.last_name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" name="email" type="email" defaultValue={member?.email ?? ""} error={e.email} required />
        <TextField label="Phone (optional)" name="phone" type="tel" defaultValue={member?.phone ?? ""} error={e.phone} />
      </div>
      <TextField label="Street address (optional)" name="address" defaultValue={member?.address ?? ""} error={e.address} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Suburb" name="suburb" defaultValue={member?.suburb ?? ""} error={e.suburb} />
        <TextField label="Postcode" name="postcode" inputMode="numeric" maxLength={4} defaultValue={member?.postcode ?? ""} error={e.postcode} />
      </div>
      <TextField label="Spouse (optional)" name="spouse" defaultValue={member?.spouse ?? ""} error={e.spouse} />
      <TextField label="Children (optional)" name="children" defaultValue={member?.children ?? ""} hint="Separate names with a semicolon, like: Ali; Aisha" error={e.children} />
      <ModalActions onCancel={onClose} pending={pending} okLabel={member ? "Save" : "Add"} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
