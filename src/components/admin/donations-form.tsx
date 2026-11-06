"use client";

import { useState } from "react";
import { saveDonations } from "@/lib/actions/donations";
import type { DonationRow, Purpose } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { Button, Card, CardHead, Field, Switch, TextField, inputClass, useFormAction } from "@/components/admin/ui";

export function DonationsForm({ donation }: { donation: DonationRow }) {
  const { state, formAction, pending } = useFormAction(saveDonations);
  const [purposes, setPurposes] = useState<Purpose[]>(donation.purposes);
  const [draft, setDraft] = useState("");
  const e = state?.errors ?? {};

  function add() {
    const name = draft.trim();
    if (!name) return;
    setPurposes((p) => [...p, { id: crypto.randomUUID(), name, on: true }]);
    setDraft("");
  }

  return (
    <form action={formAction} className="grid max-w-3xl gap-5">
      <Card className="grid gap-5">
        <CardHead title="Donate page" />
        <Field label="Message on the Donate page" error={e.intro}>
          <textarea name="intro" rows={4} defaultValue={donation.intro} className={inputClass} />
        </Field>
        <TextField label="Bank account name" name="account_name" defaultValue={donation.account_name} error={e.account_name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="BSB" name="bsb" defaultValue={donation.bsb} error={e.bsb} inputMode="numeric" placeholder="123-456" />
          <TextField label="Account number" name="account_no" defaultValue={donation.account_no} error={e.account_no} inputMode="numeric" />
        </div>
        <p className="-mt-2 text-[13px] text-muted">Leave the bank details empty to show &ldquo;please contact the committee&rdquo; on the website.</p>
      </Card>

      <Card>
        <CardHead title="What people can donate to" />
        <input type="hidden" name="purposes" value={JSON.stringify(purposes)} />
        {purposes.length === 0 && <p className="mb-3 text-sm text-muted">No choices yet. These are optional.</p>}
        <div className="grid">
          {purposes.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-0 first:pt-0">
              <Switch label={p.name} checked={p.on} onChange={(ev) => setPurposes((list) => list.map((x) => (x.id === p.id ? { ...x, on: ev.target.checked } : x)))} />
              <Button small variant="danger" onClick={() => setPurposes((list) => list.filter((x) => x.id !== p.id))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                add();
              }
            }}
            aria-label="New donation choice"
            placeholder="For example: Zakat"
            className={inputClass}
          />
          <Button onClick={add}>
            <Icon name="plus" size={16} />
            Add
          </Button>
        </div>
        {e.purposes && <p className="mt-2 text-[13px] text-[#b3261e]">{e.purposes}</p>}
      </Card>

      <p className="text-[13px] text-muted">Card payments will be added later. For now, visitors see your bank details.</p>
      {state && !state.ok && !state.errors && (
        <p role="alert" className="text-sm text-[#b3261e]">
          {state.message}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
