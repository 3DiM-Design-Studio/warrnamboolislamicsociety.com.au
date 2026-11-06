"use client";

import { saveSettings } from "@/lib/actions/settings";
import type { SettingsRow } from "@/lib/types";
import { Button, Card, Field, Switch, TextField, inputClass, useFormAction } from "@/components/admin/ui";

export function InfoForm({ settings }: { settings: SettingsRow }) {
  const { state, formAction, pending } = useFormAction(saveSettings);
  const e = state?.errors ?? {};
  return (
    <Card>
      <form action={formAction} className="grid max-w-2xl gap-5">
        <Field label="Phone numbers" error={e.phones} hint="One number on each line, for example +61 3 5555 0101 or +61 412 345 678.">
          <textarea name="phones" rows={4} defaultValue={settings.phones.join("\n")} className={inputClass} />
        </Field>
        <TextField label="Email" name="email" type="email" defaultValue={settings.email} error={e.email} required />
        <TextField label="Facebook page link" name="facebook" type="url" defaultValue={settings.facebook} error={e.facebook} placeholder="https://www.facebook.com/yourpage" />
        <TextField label="Message at the top of the website" name="banner_text" defaultValue={settings.banner_text} error={e.banner_text} placeholder="For example: Eid prayer is at 8:30 AM" />
        <Switch label="Show this message" name="banner_on" defaultChecked={settings.banner_on} />
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
    </Card>
  );
}
