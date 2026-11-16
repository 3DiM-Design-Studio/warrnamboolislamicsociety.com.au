"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { AuthHeader, Notice, authCardClass } from "@/components/admin/auth-card";
import { PasswordField } from "@/components/admin/password-field";
import { Button, TextField } from "@/components/admin/ui";

export function LoginForm({ notice }: { notice?: { tone: "good" | "bad"; text: string } | null }) {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className={authCardClass}>
      <AuthHeader />
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="-mt-2 text-sm text-muted">Please sign in to update the website.</p>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <TextField label="Email" name="email" type="email" autoComplete="username" required />
      <PasswordField label="Password" name="password" autoComplete="current-password" />
      {state && !state.ok && (
        <p role="alert" className="text-sm text-[#b3261e]">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <div className="grid gap-1.5 text-center text-[13.5px]">
        <Link href="/admin/forgot" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Forgot your password?
        </Link>
        <Link href="/admin/first-time" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Added by an admin? Send a new link
        </Link>
        <Link href="/admin/request-access" className="font-semibold text-[#0f6a4d] underline-offset-2 hover:underline">
          Want to become an admin? Request access
        </Link>
      </div>
      <p className="text-[13px] text-muted">Only people on the admin list can sign in.</p>
    </form>
  );
}
