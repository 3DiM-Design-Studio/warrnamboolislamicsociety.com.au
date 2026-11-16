import type { Metadata } from "next";
import { AuthPage } from "@/components/admin/auth-card";
import { LinkRequestForm } from "@/components/admin/link-request-form";

export const metadata: Metadata = { title: "First time here" };

export default function FirstTimePage() {
  return (
    <AuthPage>
      <LinkRequestForm mode="first" />
    </AuthPage>
  );
}
