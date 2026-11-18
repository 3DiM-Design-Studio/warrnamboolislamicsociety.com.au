import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { AdminShellSkeleton } from "@/components/skeletons";
import { getAlertCounts } from "@/lib/alert-counts";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: ReactNode }) {
  // Reading the login happens at request time, so it sits behind a Suspense boundary.
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: ReactNode }) {
  const { email, supabase } = await requireAdmin();
  // The numbers beside menu items: what is new since this admin last opened each page.
  const alerts = await getAlertCounts(supabase, email);
  return (
    <AdminShell email={email} alerts={alerts}>
      {children}
    </AdminShell>
  );
}
