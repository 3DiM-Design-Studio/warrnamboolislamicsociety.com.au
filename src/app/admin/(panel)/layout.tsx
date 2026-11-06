import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: ReactNode }) {
  // Reading the login happens at request time, so it sits behind a Suspense boundary.
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted">Loading...</div>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: ReactNode }) {
  const { email } = await requireAdmin();
  return <AdminShell email={email}>{children}</AdminShell>;
}
