"use client";

import { useState } from "react";
import { deleteSeason, saveSeason } from "@/lib/actions/jumuah";
import { fmtHM, jumuahOn, seasonCoverage, seasonRangeText, type Season } from "@/lib/prayer";
import type { JumuahRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, Field, Modal, ModalActions, TextField, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toSeason = (r: JumuahRow): Season => ({ ...r, jumuah_time: r.jumuah_time.slice(0, 5) });

// The Friday time for each season. It sits on the Prayer times page, under the preview for today.
export function JumuahSeasons({ seasons, today }: { seasons: JumuahRow[]; today: string }) {
  const [editing, setEditing] = useState<JumuahRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<JumuahRow | null>(null);
  const { run, pending } = useRunAction();

  const list = seasons.map(toSeason);
  const now = jumuahOn(today, list);
  const cov = seasonCoverage(list);

  return (
    <>
      <Card>
        <CardHead title="Jumu’ah time by season">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            Add season
          </Button>
        </CardHead>
        {seasons.length === 0 ? (
          <p className="text-sm text-muted">No seasons yet. Add one so the website can show a Jumu’ah time.</p>
        ) : (
          <List>
            {seasons.map((s) => (
              <Row
                key={s.id}
                lead={
                  <>
                    {s.name} {now && now.name === s.name && now.jumuah_time === s.jumuah_time.slice(0, 5) && <Badge tone="green">Now</Badge>}
                  </>
                }
                actions={
                  <>
                    <Button small onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                    <Button small variant="danger" onClick={() => setDeleting(s)}>
                      Delete
                    </Button>
                  </>
                }
              >
                <span>
                  {seasonRangeText(toSeason(s))} &middot; <b className="text-foreground">{fmtHM(s.jumuah_time.slice(0, 5))}</b>
                </span>
              </Row>
            ))}
          </List>
        )}
        <p className="mt-4 text-[13px] text-muted">Seasons repeat every year. The website switches by itself when a new season starts.</p>
        {!cov.ok && (
          <div role="alert" className="mt-4 rounded-xl bg-[#fbe5e3] p-4 text-sm">
            {cov.gaps.length > 0 && <p>No Jumu’ah time on: {cov.gaps.join(", ")}.</p>}
            {cov.overlaps.length > 0 && <p>Two seasons overlap on: {cov.overlaps.join(", ")}.</p>}
            <p className="mt-1">Please change the dates so each day has exactly one season.</p>
          </div>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add season" : "Edit season"}>
        {editing && <SeasonForm key={editing === "new" ? "new" : editing.id} season={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete "${deleting.name}"? Those dates will have no Jumu’ah time until you add a season.` : ""}
        onConfirm={() => deleting && run(() => deleteSeason(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function SeasonForm({ season, onClose }: { season: JumuahRow | null; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveSeason, onClose);
  const e = state?.errors ?? {};
  const month = (name: string, value: number) => (
    <select name={name} defaultValue={value} aria-label={name} className={inputClass}>
      {MONTHS.map((m, i) => (
        <option key={m} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
  );
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={season?.id ?? ""} />
      <TextField label="Name" name="name" defaultValue={season?.name ?? ""} error={e.name} placeholder="Autumn and winter" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From" error={e.start_day}>
          {month("start_month", season?.start_month ?? 3)}
          <input name="start_day" type="number" min={1} max={31} defaultValue={season?.start_day ?? 1} aria-label="Start day" className={inputClass} />
        </Field>
        <Field label="Until" error={e.end_day}>
          {month("end_month", season?.end_month ?? 8)}
          <input name="end_day" type="number" min={1} max={31} defaultValue={season?.end_day ?? 31} aria-label="End day" className={inputClass} />
        </Field>
      </div>
      <TextField label="Jumu’ah time" name="jumuah_time" type="time" defaultValue={season?.jumuah_time.slice(0, 5) ?? "12:30"} error={e.jumuah_time} required />
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
