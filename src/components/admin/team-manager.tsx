"use client";

import { useState } from "react";
import { deleteTeamMember, moveTeamMember, saveTeamMember } from "@/lib/actions/team";
import type { TeamRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { Avatar, List, Row } from "@/components/admin/list";
import { PhotoField } from "@/components/admin/photo-field";
import { Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

export function TeamManager({ team }: { team: TeamRow[] }) {
  const [editing, setEditing] = useState<TeamRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<TeamRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
      <Card>
        <CardHead title="Committee">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            Add person
          </Button>
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">Shown on the About page in this order. People with the same role are grouped together.</p>
        {team.length === 0 ? (
          <EmptyNote>No one added yet.</EmptyNote>
        ) : (
          <List>
            {team.map((m, i) => (
              <Row
                key={m.id}
                lead={
                  <span className="flex items-center gap-3.5">
                    <Avatar name={m.name} photo={m.photo_url} round />
                    <span>
                      {m.name}
                      <span className="block text-[13px] font-normal text-muted">{m.role}</span>
                    </span>
                  </span>
                }
                actions={
                  <>
                    <Button small aria-label="Move up" disabled={pending || i === 0} onClick={() => run(() => moveTeamMember(m.id, -1))}>
                      <Icon name="up" size={14} />
                    </Button>
                    <Button small aria-label="Move down" disabled={pending || i === team.length - 1} onClick={() => run(() => moveTeamMember(m.id, 1))}>
                      <Icon name="down" size={14} />
                    </Button>
                    <Button small onClick={() => setEditing(m)}>
                      Edit
                    </Button>
                    <Button small variant="danger" onClick={() => setDeleting(m)}>
                      Remove
                    </Button>
                  </>
                }
              />
            ))}
          </List>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add person" : "Edit person"}>
        {editing && <TeamForm key={editing === "new" ? "new" : editing.id} member={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        confirmLabel="Remove"
        message={deleting ? `Remove ${deleting.name} from the team page?` : ""}
        onConfirm={() => deleting && run(() => deleteTeamMember(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function TeamForm({ member, onClose }: { member: TeamRow | null; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveTeamMember, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <TextField label="Name" name="name" defaultValue={member?.name ?? ""} error={e.name} required />
      <TextField label="Role" name="role" defaultValue={member?.role ?? ""} error={e.role} placeholder="President" required />
      <PhotoField defaultValue={member?.photo_url} />
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
