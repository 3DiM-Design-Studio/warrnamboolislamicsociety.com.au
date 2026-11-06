"use client";

import { useState } from "react";
import { deleteSeason, saveSeason } from "@/lib/actions/jumuah";
import { fmtHM, jumuahOn, seasonCoverage, seasonRangeText, type Season } from "@/lib/prayer";
import type { JumuahRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, Field, Modal, ModalActions, TextField, cx, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toSeason = (r: JumuahRow): Season => ({ ...r, jumuah_time: r.jumuah_time.slice(0, 5) });

export function JumuahManager({ seasons, today }: { seasons: JumuahRow[]; today: string }) {
  const [editing, setEditing] = useState<JumuahRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<JumuahRow | null>(null);
  const { run, pending } = useRunAction();

  const list = seasons.map(toSeason);
  const now = jumuahOn(today, list);
  const cov = seasonCoverage(list);

  return (
    <>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
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
          </Card>
          {!cov.ok && (
            <div role="alert" className="rounded-xl bg-[#fbe5e3] p-4 text-sm">
              {cov.gaps.length > 0 && <p>No Jumu’ah time on: {cov.gaps.join(", ")}.</p>}
              {cov.overlaps.length > 0 && <p>Two seasons overlap on: {cov.overlaps.join(", ")}.</p>}
              <p className="mt-1">Please change the dates so each day has exactly one season.</p>
            </div>
          )}
        </div>

        <Card>
          <p className="text-[13px] text-muted">Jumu’ah today</p>
          <p className="my-1 text-5xl font-bold tracking-tight tabular-nums">{now ? fmtHM(now.jumuah_time) : "Not set"}</p>
          <p className="mb-5 text-sm text-muted">{now ? now.name : "No season covers today."}</p>
          <Calendar today={today} />
        </Card>
      </div>

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

function Calendar({ today }: { today: string }) {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const day = Number(today.slice(8, 10));
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold">
        {MONTHS[month - 1]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-xs font-semibold text-muted">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <span
              key={d}
              className={cx(
                "mx-auto grid size-9 place-items-center rounded-full",
                i % 7 === 5 && "bg-brand-gradient font-bold text-brand-dark",
                d === day && "ring-2 ring-brand-dark ring-offset-1",
              )}
            >
              {d}
            </span>
          ),
        )}
      </div>
    </div>
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
