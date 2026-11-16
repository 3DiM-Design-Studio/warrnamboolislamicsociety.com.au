import type { Metadata } from "next";
import { AuthPage } from "@/components/admin/auth-card";
import { RequestAccessForm } from "@/components/admin/request-access-form";

export const metadata: Metadata = { title: "Request access" };

export default function RequestAccessPage() {
  return (
    <AuthPage>
      <RequestAccessForm />
    </AuthPage>
  );
}
