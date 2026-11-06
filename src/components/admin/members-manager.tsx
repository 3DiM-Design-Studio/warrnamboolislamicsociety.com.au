"use client";

import { useState } from "react";
import { addMember, approveMember, deleteMember } from "@/lib/actions/members";
import type { MemberRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, TextField, cx, useFormAction, useRunAction } from "@/components/admin/ui";

export function MembersManager({ members }: { members: MemberRow[] }) {
  const [filter, setFilter] = useState<"all" | "new">("all");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<MemberRow | null>(null);
  const { run, pending } = useRunAction();
  const fresh = members.filter((m) => m.status === "new").length;
  const shown = members.filter((m) => filter === "all" || m.status === "new");

  return (
    <>
      <Card>
        <CardHead title="Membership">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-full border border-[#cfd1c7] bg-white" role="group" aria-label="Show">
              {(["all", "new"] as const).map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cx("px-4 py-2 text-sm font-semibold", filter === f ? "bg-brand-dark text-white" : "text-muted")}
                >
                  {f === "all" ? `Everyone (${members.length})` : `New (${fresh})`}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} />
              Add member
            </Button>
          </div>
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">People who join on the website&rsquo;s Membership page show up here as New.</p>
        {shown.length === 0 ? (
          <EmptyNote>{filter === "new" ? "No new requests. All reviewed." : "No members yet."}</EmptyNote>
        ) : (
          <List>
            {shown.map((m) => (
              <Row
                key={m.id}
                lead={
                  <span className="flex items-center gap-3.5">
                    <Avatar name={m.name} round />
                    <span>
                      {m.name} {m.status === "new" ? <Badge tone="gold">New</Badge> : <Badge tone="green">Member</Badge>}
                    </span>
                  </span>
                }
                actions={
                  <>
                    {m.status === "new" && (
                      <Button small variant="primary" disabled={pending} onClick={() => run(() => approveMember(m.id))}>
                        Approve
                      </Button>
                    )}
                    <Button small variant="danger" onClick={() => setDeleting(m)}>
                      Delete
                    </Button>
                  </>
                }
              >
                <span className="pl-[58px] max-sm:pl-0">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""} · {fmtDate(m.created_at.slice(0, 10))}
                  {m.amount_cents != null && ` · paid ${(m.amount_cents / 100).toFixed(2)}`}
                </span>
                {m.details && <span className="basis-full pl-[58px] max-sm:pl-0">{m.details}</span>}
              </Row>
            ))}
          </List>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add member">
        {adding && <AddForm onClose={() => setAdding(false)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete ${deleting.name} from the list?` : ""}
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
      <TextField label="Name" name="name" error={e.name} required />
      <TextField label="Email" name="email" type="email" error={e.email} required />
      <TextField label="Phone (optional)" name="phone" type="tel" error={e.phone} />
      <ModalActions onCancel={onClose} pending={pending} okLabel="Add" message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
