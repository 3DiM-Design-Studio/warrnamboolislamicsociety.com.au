import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/admin/auth-card";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

type Search = Promise<{ error?: string | string[]; notice?: string | string[] }>;

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

const MESSAGES: Record<string, { tone: "good" | "bad"; text: string }> = {
  "not-admin": { tone: "bad", text: "That login is not on the admin list. Please ask an admin to add you." },
  idle: { tone: "bad", text: "You were signed out because you were away for a long time. Please sign in again." },
  "link-expired": { tone: "bad", text: "That link has expired or was already used. Please ask for a new one." },
  "signed-out": { tone: "good", text: "You have been signed out." },
};

async function Form({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const key = first(sp.error) ?? first(sp.notice);
  return <LoginForm notice={key ? (MESSAGES[key] ?? null) : null} />;
}

export default function LoginPage({ searchParams }: { searchParams: Search }) {
  return (
    <AuthPage>
      {/* The notice comes from the address, which is only known when someone visits. */}
      <Suspense fallback={<LoginForm />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}
