"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestFirstTimeLink, requestResetLink } from "@/lib/actions/auth";
import { AuthHeader, Notice, authCardClass } from "@/components/admin/auth-card";
import { Button, TextField } from "@/components/admin/ui";

const COPY = {
  reset: {
    title: "Forgot your password?",
    intro: "Type your email. We will send you a link to choose a new password.",
    button: "Email me a link",
    sending: "Sending...",
  },
  first: {
    title: "First time here?",
    intro: "Type the email an admin added for you. We will send you a link to choose your own password.",
    button: "Email me a link",
    sending: "Sending...",
  },
} as const;

export function LinkRequestForm({ mode }: { mode: "reset" | "first" }) {
  const [state, action, pending] = useActionState(mode === "reset" ? requestResetLink : requestFirstTimeLink, null);
  const copy = COPY[mode];
  return (
    <form action={action} className={authCardClass}>
      <AuthHeader />
      <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
      <p className="-mt-2 text-sm text-muted">{copy.intro}</p>
      {state?.ok && <Notice tone="good">{state.message}</Notice>}
      {state && !state.ok && <Notice tone="bad">{state.message}</Notice>}
      <TextField label="Email" name="email" type="email" autoComplete="username" required />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? copy.sending : copy.button}
      </Button>
      <p className="text-center text-[13.5px]">
        <Link href="/admin/login" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
