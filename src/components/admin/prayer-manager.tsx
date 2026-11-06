"use client";

import { useMemo, useState } from "react";
import { deleteRamadan, savePrayerSettings, saveRamadan } from "@/lib/actions/prayer";
import {
  METHODS,
  PRAYERS,
  dayBoard,
  fmtHM,
  fmtTime,
  type AsrRule,
  type IqamahRules,
  type MethodKey,
  type PrayerKey,
} from "@/lib/prayer";
import type { PrayerSettingsRow, RamadanRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { List, Row } from "@/components/admin/list";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Field, Modal, ModalActions, Switch, TextField, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

export function PrayerManager({ settings, ramadan, today }: { settings: PrayerSettingsRow; ramadan: RamadanRow[]; today: string }) {
  const [method, setMethod] = useState<MethodKey>(settings.method);
  const [asr, setAsr] = useState<AsrRule>(settings.asr);
  const [rules, setRules] = useState<IqamahRules>(settings.rules);
  const [editing, setEditing] = useState<RamadanRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<RamadanRow | null>(null);
  const { run, pending: runPending } = useRunAction();
  const { state, formAction, pending } = useFormAction(savePrayerSettings);
  const errors = state?.errors ?? {};

  const board = useMemo(
    () =>
      dayBoard(
        today,
        { method, asr, rules },
        ramadan.map((r) => ({ name: r.name, start_date: r.start_date, end_date: r.end_date, isha_iqamah: r.isha_iqamah.slice(0, 5), taraweeh: r.taraweeh.slice(0, 5) })),
      ),
    [today, method, asr, rules, ramadan],
  );

  function setRule(key: PrayerKey, patch: Partial<IqamahRules[PrayerKey]>) {
    setRules((r) => ({ ...r, [key]: { ...r[key], ...patch } }));
  }

  return (
    <>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          <Card>
            <form action={formAction} className="grid gap-4">
              <CardHead title="Iqamah times" />
              <p className="-mt-2 text-[13px] text-muted">Azan times are worked out automatically for Warrnambool. You only choose when the Iqamah is.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[13px] text-muted">
                    <tr>
                      <th className="py-1.5 pr-3 font-semibold">Prayer</th>
                      <th className="py-1.5 pr-3 font-semibold">Iqamah is</th>
                      <th className="py-1.5 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {PRAYERS.map(([key, label]) => {
                      const r = rules[key];
                      return (
                        <tr key={key} className="border-t border-border align-top">
                          <td className="py-3 pr-3 font-semibold">{label}</td>
                          <td className="py-2 pr-3">
                            <select
                              aria-label={`${label} type`}
                              name={`${key}_mode`}
                              value={r.mode}
                              onChange={(e) => setRule(key, { mode: e.target.value as "offset" | "fixed" })}
                              className={inputClass}
                            >
                              <option value="offset">Minutes after Azan</option>
                              <option value="fixed">Same time every day</option>
                            </select>
                          </td>
                          <td className="py-2">
                            <input type="hidden" name={`${key}_offset`} value={r.offset} />
                            <input type="hidden" name={`${key}_time`} value={r.time} />
                            {r.mode === "offset" ? (
                              <input
                                aria-label={`${label} minutes`}
                                type="number"
                                min={0}
                                max={90}
                                value={r.offset}
                                onChange={(e) => setRule(key, { offset: Number(e.target.value) })}
                                className={inputClass + " w-24"}
                              />
                            ) : (
                              <input aria-label={`${label} time`} type="time" value={r.time} onChange={(e) => setRule(key, { time: e.target.value })} className={inputClass + " w-36"} />
                            )}
                            {errors[key] && <p className="mt-1 text-[13px] text-[#b3261e]">{errors[key]}</p>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-muted">Advanced (leave as it is)</summary>
                <div className="mt-3 grid gap-4">
                  <Field label="Azan method">
                    <select name="method" value={method} onChange={(e) => setMethod(e.target.value as MethodKey)} className={inputClass}>
                      {(Object.keys(METHODS) as MethodKey[]).map((k) => (
                        <option key={k} value={k}>
                          {METHODS[k].name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Asr">
                    <select name="asr" value={asr} onChange={(e) => setAsr(e.target.value as AsrRule)} className={inputClass}>
                      <option value="standard">Standard</option>
                      <option value="hanafi">Hanafi</option>
                    </select>
                  </Field>
                </div>
              </details>

              <Switch label="Show prayer times on the website" name="show_on_site" defaultChecked={settings.show_on_site} />
              <p className="-mt-2 text-[13px] text-muted">Keep this off until the committee has checked the times in the preview.</p>
              {state && !state.ok && !state.errors && (
                <p role="alert" className="text-sm text-[#b3261e]">
                  {state.message}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={pending}>
                  {pending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHead title="Ramadan">
              <Button small onClick={() => setEditing("new")}>
                <Icon name="plus" size={14} />
                Add dates
              </Button>
            </CardHead>
            <p className="mb-3 text-[13px] text-muted">During Ramadan the website shows the Isha and Taraweeh times set here.</p>
            {ramadan.length === 0 ? (
              <EmptyNote>No Ramadan dates added.</EmptyNote>
            ) : (
              <List>
                {ramadan.map((r) => (
                  <Row
                    key={r.id}
                    lead={r.name}
                    actions={
                      <>
                        <Button small onClick={() => setEditing(r)}>
                          Edit
                        </Button>
                        <Button small variant="danger" onClick={() => setDeleting(r)}>
                          Delete
                        </Button>
                      </>
                    }
                  >
                    <span>
                      {fmtDate(r.start_date)} to {fmtDate(r.end_date)} &middot; Isha {fmtHM(r.isha_iqamah.slice(0, 5))} &middot; Taraweeh {fmtHM(r.taraweeh.slice(0, 5))}
                    </span>
                  </Row>
                ))}
              </List>
            )}
          </Card>
        </div>

        <Card>
          <CardHead title="Preview for today">{settings.show_on_site ? <Badge tone="green">On website</Badge> : <Badge tone="gold">Hidden</Badge>}</CardHead>
          <p className="mb-3 text-[13px] text-muted">{fmtDate(today, true)}. Changes show here before you save.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[13px] text-muted">
                <tr>
                  <th className="py-1.5 font-semibold">Prayer</th>
                  <th className="py-1.5 font-semibold">Azan</th>
                  <th className="py-1.5 font-semibold">Iqamah</th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((r) => (
                  <tr key={r.key} className={"border-t border-border " + (r.key === "sunrise" ? "text-muted" : "")}>
                    <td className="py-2.5 font-semibold">
                      {r.name} {r.ramadan && <Badge tone="gold">Ramadan</Badge>}
                    </td>
                    <td className="py-2.5 tabular-nums">{r.azan == null ? "" : fmtTime(r.azan)}</td>
                    <td className="py-2.5 font-bold tabular-nums">{r.iqamah == null ? "" : fmtTime(r.iqamah)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add Ramadan dates" : "Edit Ramadan dates"}>
        {editing && <RamadanForm key={editing === "new" ? "new" : editing.id} period={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={runPending}
        message={deleting ? `Delete "${deleting.name}"?` : ""}
        onConfirm={() => deleting && run(() => deleteRamadan(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function RamadanForm({ period, onClose }: { period: RamadanRow | null; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveRamadan, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={period?.id ?? ""} />
      <TextField label="Name" name="name" defaultValue={period?.name ?? "Ramadan"} error={e.name} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First day" name="start_date" type="date" defaultValue={period?.start_date ?? ""} error={e.start_date} required />
        <TextField label="Last day" name="end_date" type="date" defaultValue={period?.end_date ?? ""} error={e.end_date} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Isha Iqamah" name="isha_iqamah" type="time" defaultValue={period?.isha_iqamah.slice(0, 5) ?? "21:15"} error={e.isha_iqamah} required />
        <TextField label="Taraweeh" name="taraweeh" type="time" defaultValue={period?.taraweeh.slice(0, 5) ?? "21:45"} error={e.taraweeh} required />
      </div>
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
