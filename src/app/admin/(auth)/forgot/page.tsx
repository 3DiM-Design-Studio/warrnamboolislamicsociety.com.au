import type { Metadata } from "next";
import { AuthPage } from "@/components/admin/auth-card";
import { LinkRequestForm } from "@/components/admin/link-request-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <AuthPage>
      <LinkRequestForm mode="reset" />
    </AuthPage>
  );
}
