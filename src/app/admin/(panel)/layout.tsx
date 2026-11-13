import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: ReactNode }) {
  // Reading the login happens at request time, so it sits behind a Suspense boundary.
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Loading...</div>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: ReactNode }) {
  const { email, supabase } = await requireAdmin();
  // The red count beside "Messages" in the menu. If the table is not set up yet, show no count.
  const { count } = await supabase.from("contacts").select("id", { count: "exact", head: true }).eq("status", "new");
  return (
    <AdminShell email={email} newMessages={count ?? 0}>
      {children}
    </AdminShell>
  );
}
