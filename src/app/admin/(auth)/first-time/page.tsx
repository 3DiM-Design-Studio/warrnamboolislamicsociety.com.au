import type { Metadata } from "next";
import { AuthPage } from "@/components/admin/auth-card";
import { RequestAccessForm } from "@/components/admin/request-access-form";

export const metadata: Metadata = { title: "First time here" };

export default function FirstTimePage() {
  return (
    <AuthPage>
      <RequestAccessForm />
    </AuthPage>
  );
}
