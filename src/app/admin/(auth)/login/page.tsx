import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-content-center justify-items-center gap-5 bg-background px-4 py-10">
      <LoginForm />
      <p className="text-[13px] text-muted">
        Powered by <b className="font-semibold text-foreground">3DiM Design Studio</b>
      </p>
    </div>
  );
}
