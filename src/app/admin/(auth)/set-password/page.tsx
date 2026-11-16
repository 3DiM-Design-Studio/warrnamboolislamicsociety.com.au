import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/admin/auth-card";
import { SetPasswordForm } from "@/components/admin/set-password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose your password" };

// Reached from the emailed link, or from "Change password" in the menu. Only a signed-in admin gets in.
async function Form() {
  const { email } = await requireAdmin();
  return <SetPasswordForm email={email} />;
}

export default function SetPasswordPage() {
  return (
    <AuthPage>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <Form />
      </Suspense>
    </AuthPage>
  );
}
