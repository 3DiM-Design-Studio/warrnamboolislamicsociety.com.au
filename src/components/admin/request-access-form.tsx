"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestAdminAccess } from "@/lib/actions/auth";
import { AuthHeader, Notice, authCardClass } from "@/components/admin/auth-card";
import { Button, TextField } from "@/components/admin/ui";

export function RequestAccessForm() {
  const [state, action, pending] = useActionState(requestAdminAccess, null);
  const e = state?.errors ?? {};
  return (
    <form action={action} className={authCardClass}>
      <AuthHeader />
      <h1 className="text-2xl font-bold tracking-tight">First time here?</h1>
      <p className="-mt-2 text-sm text-muted">Type your name and email. If an admin already added you, we email you a link to choose your password. If not, an admin will see your request and can approve it.</p>
      {state?.ok && <Notice tone="good">{state.message}</Notice>}
      {state && !state.ok && !state.errors && <Notice tone="bad">{state.message}</Notice>}
      <TextField label="Your name" name="name" autoComplete="name" maxLength={80} error={e.name} required />
      <TextField label="Your email" name="email" type="email" autoComplete="username" error={e.email} required />
      {/* Real people never see this box. Robots fill it in, and their request is ignored. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Sending..." : "Continue"}
      </Button>
      <p className="text-center text-[13.5px]">
        <Link href="/admin/login" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
