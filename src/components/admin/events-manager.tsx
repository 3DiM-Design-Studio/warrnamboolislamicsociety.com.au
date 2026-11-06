"use client";

import { useState } from "react";
import { deleteEvent, saveEvent } from "@/lib/actions/events";
import { fmtHM } from "@/lib/prayer";
import type { EventRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, Switch, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

export function EventsManager({ events, today }: { events: EventRow[]; today: string }) {
  const [editing, setEditing] = useState<EventRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<EventRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
      <Card>
        <CardHead title="All events">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            Add event
          </Button>
        </CardHead>
        {events.length === 0 ? (
          <EmptyNote>No events yet. Press &ldquo;Add event&rdquo; to create one.</EmptyNote>
        ) : (
          <List>
            {events.map((e) => {
              const past = e.event_date < today;
              return (
                <Row
                  key={e.id}
                  dim={past}
                  lead={e.title}
                  actions={
                    <>
                      <Button small onClick={() => setEditing(e)}>
                        Edit
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(e)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <span>
                    {fmtDate(e.event_date, true)}, {fmtHM(e.event_time.slice(0, 5))} &middot; {e.place}
                  </span>
                  {past ? <Badge>Finished</Badge> : e.status === "published" ? <Badge tone="green">On website</Badge> : <Badge>Draft</Badge>}
                </Row>
              );
            })}
          </List>
        )}
        <p className="mt-4 text-[13px] text-muted">Finished events are hidden from the website automatically.</p>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add event" : "Edit event"}>
        {editing && <EventForm key={editing === "new" ? "new" : editing.id} event={editing === "new" ? null : editing} today={today} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete "${deleting.title}"?` : ""}
        onConfirm={() => deleting && run(() => deleteEvent(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function EventForm({ event, today, onClose }: { event: EventRow | null; today: string; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveEvent, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={event?.id ?? ""} />
      <TextField label="Event name" name="title" defaultValue={event?.title ?? ""} error={e.title} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Date" name="event_date" type="date" defaultValue={event?.event_date ?? today} error={e.event_date} required />
        <TextField label="Time" name="event_time" type="time" defaultValue={event?.event_time.slice(0, 5) ?? "18:00"} error={e.event_time} required />
      </div>
      <TextField label="Where" name="place" defaultValue={event?.place ?? ""} error={e.place} placeholder="Masjid hall" />
      <Switch label="Show on the website" name="published" defaultChecked={event ? event.status === "published" : true} />
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
