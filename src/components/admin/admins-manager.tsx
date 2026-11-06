"use client";

import { useState } from "react";
import { addAdmin, removeAdmin } from "@/lib/actions/admins";
import type { AdminRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { Avatar, List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, Modal, ModalActions, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

export function AdminsManager({ admins, me }: { admins: AdminRow[]; me: string }) {
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AdminRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
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
                  <Button small variant="danger" onClick={() => setRemoving(a)}>
                    Remove
                  </Button>
                )
              }
            />
          ))}
        </List>
        <div className="mt-5 rounded-xl bg-[#f6edd6] p-4 text-sm">
          <b>Adding a new person takes two steps.</b>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>Add their email here. This is what lets them make changes.</li>
            <li>Create their login in Supabase: Authentication, then Users, then Add user (same email, and a password they will keep).</li>
          </ol>
          <p className="mt-2 text-muted">There is no public sign-up. Someone with a login who is not on this list cannot change anything.</p>
        </div>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add someone to the admin list" small>
        {adding && <AddForm onClose={() => setAdding(false)} />}
      </Modal>
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        pending={pending}
        confirmLabel="Remove"
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
