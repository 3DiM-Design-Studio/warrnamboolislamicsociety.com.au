"use client";

import { useState } from "react";
import { deleteEvent, saveEvent } from "@/lib/actions/events";
import { EVENT_TYPES, HAS_SPEAKER, eventTypeLabel } from "@/lib/event-types";
import { fmtHM } from "@/lib/prayer";
import type { EventRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { List, Row } from "@/components/admin/list";
import { PhotoField } from "@/components/admin/photo-field";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Field, Modal, ModalActions, TextField, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

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
              const past = (e.end_date ?? e.event_date) < today;
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
                  <Badge tone="gold">{eventTypeLabel(e.event_type)}</Badge>
                  {past ? (
                    <Badge>Finished</Badge>
                  ) : e.status === "cancelled" ? (
                    <Badge tone="red">Cancelled</Badge>
                  ) : e.status === "published" ? (
                    <Badge tone="green">On website</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
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
  const [type, setType] = useState(event?.event_type ?? "bayan");

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={event?.id ?? ""} />

      <Field label="What kind of event is it?" error={e.event_type}>
        <select name="event_type" value={type} onChange={(ev) => setType(ev.target.value)} className={inputClass}>
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <TextField label="Event name" name="title" defaultValue={event?.title ?? ""} error={e.title} required />
      {HAS_SPEAKER.includes(type) && (
        <TextField label={type === "quran_class" ? "Teacher" : "Speaker"} name="speaker" defaultValue={event?.speaker ?? ""} error={e.speaker} placeholder="For example: Moulavi Ahmed" />
      )}
      <TextField label="Short description" name="short_description" defaultValue={event?.short_description ?? ""} error={e.short_description} hint="One or two lines. Shown on the event card." maxLength={300} />
      <Field label="Full description (optional)" error={e.description}>
        <textarea name="description" rows={5} defaultValue={event?.description ?? ""} maxLength={5000} className={inputClass} />
      </Field>
      <PhotoField name="photo_url" label="Event picture (optional)" defaultValue={event?.photo_url} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Starts: date" name="event_date" type="date" defaultValue={event?.event_date ?? today} error={e.event_date} required />
        <TextField label="Starts: time" name="event_time" type="time" defaultValue={event?.event_time.slice(0, 5) ?? "18:00"} error={e.event_time} required />
        <TextField label="Ends: date (optional)" name="end_date" type="date" defaultValue={event?.end_date ?? ""} error={e.end_date} />
        <TextField label="Ends: time (optional)" name="end_time" type="time" defaultValue={event?.end_time?.slice(0, 5) ?? ""} error={e.end_time} />
      </div>

      <TextField label="Where" name="place" defaultValue={event?.place === "To be announced" ? "" : (event?.place ?? "")} error={e.place} placeholder="Masjid hall" />
      <TextField label="Map link (optional)" name="map_url" type="url" defaultValue={event?.map_url ?? ""} error={e.map_url} hint="Paste the Google Maps link." placeholder="https://maps.google.com/..." />
      <TextField label="Who is it for? (optional)" name="audience" defaultValue={event?.audience ?? ""} error={e.audience} placeholder="For example: Children aged 6 to 12" />
      <Field label="Special notes (optional)" error={e.notes} hint="For example: bring a dish, register by Friday.">
        <textarea name="notes" rows={3} defaultValue={event?.notes ?? ""} maxLength={1000} className={inputClass} />
      </Field>

      <Field label="Show on the website?" error={e.status}>
        <select name="status" defaultValue={event?.status ?? "published"} className={inputClass}>
          <option value="published">Yes, show it</option>
          <option value="draft">No, keep it as a draft</option>
          <option value="cancelled">Cancelled (hide it)</option>
        </select>
      </Field>
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
