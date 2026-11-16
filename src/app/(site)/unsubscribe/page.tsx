import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

export default function UnsubscribePage() {
  return (
    <PageShell title="Unsubscribe from updates." crumb="Unsubscribe">
      <Suspense fallback={null}>
        <UnsubscribeForm />
      </Suspense>
    </PageShell>
  );
}
