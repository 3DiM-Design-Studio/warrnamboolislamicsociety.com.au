"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setPassword } from "@/lib/actions/auth";
import { AuthHeader, authCardClass } from "@/components/admin/auth-card";
import { PasswordField } from "@/components/admin/password-field";
import { Button } from "@/components/admin/ui";

export function SetPasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(setPassword, null);
  const e = state?.errors ?? {};
  return (
    <form action={action} className={authCardClass}>
      <AuthHeader />
      <h1 className="text-2xl font-bold tracking-tight">Choose your password</h1>
      <p className="-mt-2 text-sm text-muted">
        For <b className="text-foreground">{email}</b>. You will use it every time you sign in.
      </p>
      <PasswordField label="New password" name="password" autoComplete="new-password" minLength={8} error={e.password} hint="At least 8 letters or numbers. A few words together is easy to remember." />
      <PasswordField label="Type it again" name="again" autoComplete="new-password" minLength={8} error={e.again} />
      {state && !state.ok && !state.errors && (
        <p role="alert" className="text-sm text-[#b3261e]">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving..." : "Save password"}
      </Button>
      <p className="text-center text-[13.5px]">
        <Link href="/admin" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Back to the admin
        </Link>
      </p>
    </form>
  );
}
