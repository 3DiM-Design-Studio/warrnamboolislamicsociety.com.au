"use client";

import { useState } from "react";
import { addAdmin, approveAdminRequest, declineAdminRequest, removeAdmin, resendAdminLink } from "@/lib/actions/admins";
import type { AdminRequestRow, AdminRow } from "@/lib/types";
import { fmtDate, melbourneDay } from "@/components/admin/format";
import { Icon } from "@/components/admin/icons";
import { Avatar, List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, Modal, ModalActions, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

export function AdminsManager({ admins, requests, me }: { admins: AdminRow[]; requests: AdminRequestRow[]; me: string }) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AdminRow | null>(null);
  const [approving, setApproving] = useState<AdminRequestRow | null>(null);
  const [declining, setDeclining] = useState<AdminRequestRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
      {requests.length > 0 && (
        <Card>
          <CardHead title="Waiting for your approval">
            <Badge tone="gold">{requests.length}</Badge>
          </CardHead>
          <p className="-mt-2 mb-3 text-[13px] text-muted">These people asked to become admins. Only approve people you know. Approving emails them a link to choose their password.</p>
          <List>
            {requests.map((r) => (
              <Row
                key={r.id}
                lead={
                  <span className="flex items-center gap-3.5">
                    <Avatar name={r.name} round />
                    <span>
                      {r.name}
                      <span className="block text-[13px] font-normal text-muted">
                        {r.email} &middot; asked {fmtDate(melbourneDay(r.created_at))}
                      </span>
                    </span>
                  </span>
                }
                actions={
                  <>
                    <Button small variant="primary" onClick={() => setApproving(r)}>
                      Approve
                    </Button>
                    <Button small variant="danger" onClick={() => setDeclining(r)}>
                      Decline
                    </Button>
                  </>
                }
              />
            ))}
          </List>
        </Card>
      )}

      <Card>
        <CardHead title="People who can log in">
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} />
            Add someone
          </Button>
        </CardHead>
        <List>
          {admins.map((a) => (
            <Row
              key={a.email}
              lead={
                <span className="flex items-center gap-3.5">
                  <Avatar name={a.email.split("@")[0]} round />
                  <span>
                    {a.email} {a.email === me && <Badge>You</Badge>}
                  </span>
                </span>
              }
              actions={
                a.email !== me && (
                  <>
                    <Button small disabled={pending} onClick={() => run(() => resendAdminLink(a.email))}>
                      Send link
                    </Button>
                    <Button small variant="danger" onClick={() => setRemoving(a)}>
                      Remove
                    </Button>
                  </>
                )
              }
            />
          ))}
        </List>
        <div className="mt-5 rounded-xl bg-[#f6edd6] p-4 text-sm">
          <b>How new people join</b>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>You add their email here: they are emailed a link to choose a password straight away. No approval step.</li>
            <li>They ask on the sign-in page (&ldquo;Request access&rdquo;): their request appears above, and you press Approve.</li>
          </ul>
          <p className="mt-2 text-muted">The link works once and lasts 1 hour. If it runs out, press &ldquo;Send link&rdquo; beside their name. Someone who is not on this list cannot sign in or change anything.</p>
        </div>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add someone to the admin list" small>
        {adding && <AddForm onClose={() => setAdding(false)} />}
      </Modal>
      <ConfirmDialog
        open={approving !== null}
        onClose={() => setApproving(null)}
        pending={pending}
        variant="primary"
        confirmLabel="Yes, approve"
        message={approving ? `Make ${approving.name} (${approving.email}) an admin? They will be emailed a link to choose a password, and can then change everything on the website.` : ""}
        onConfirm={() => approving && run(() => approveAdminRequest(approving.id), () => setApproving(null))}
      />
      <ConfirmDialog
        open={declining !== null}
        onClose={() => setDeclining(null)}
        pending={pending}
        confirmLabel="Yes, decline"
        message={declining ? `Decline the request from ${declining.name} (${declining.email})?` : ""}
        onConfirm={() => declining && run(() => declineAdminRequest(declining.id), () => setDeclining(null))}
      />
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        pending={pending}
        confirmLabel="Yes, remove"
        message={removing ? `Remove ${removing.email}? They will not be able to change anything any more.` : ""}
        onConfirm={() => removing && run(() => removeAdmin(removing.email), () => setRemoving(null))}
      />
    </>
  );
}

function AddForm({ onClose }: { onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(addAdmin, onClose, { site: false });
  return (
    <form action={formAction} className="grid gap-4">
      <TextField label="Email" name="email" type="email" error={state?.errors?.email} required />
      <ModalActions onCancel={onClose} pending={pending} okLabel="Add" message={state && !state.ok && !state.errors ? state.message : undefined} />
    </form>
  );
}
