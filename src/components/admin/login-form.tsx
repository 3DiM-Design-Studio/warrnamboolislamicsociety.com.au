"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { LogoMark } from "@/components/logo-mark";
import { Button, TextField } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="grid w-[min(380px,calc(100vw-2rem))] gap-4 rounded-[18px] border border-border bg-card p-8">
      <div className="flex items-center gap-3 font-bold">
        <LogoMark className="size-11" src="/admin-logo.png" />
        <span className="leading-tight">
          WIS Admin
          <small className="block text-[11.5px] font-normal text-muted">Warrnambool Islamic Society</small>
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="-mt-2 text-sm text-muted">Please sign in to update the website.</p>
      <TextField label="Email" name="email" type="email" autoComplete="username" required />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
      {state && !state.ok && (
        <p role="alert" className="text-sm text-[#b3261e]">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-[13px] text-muted">Only people on the admin list can sign in.</p>
    </form>
  );
}
