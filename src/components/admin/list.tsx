import type { ReactNode } from "react";
import { cx } from "@/components/admin/ui";

export function List({ children }: { children: ReactNode }) {
  return <div className="grid">{children}</div>;
}

export function Row({ lead, children, actions, dim }: { lead: ReactNode; children?: ReactNode; actions?: ReactNode; dim?: boolean }) {
  return (
    <div className={cx("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border py-3.5 first:border-0 first:pt-0 last:pb-0 max-sm:grid-cols-1", dim && "opacity-60")}>
      <div className="min-w-0">
        <div className="break-words font-semibold">{lead}</div>
        {children && <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

export function Avatar({ name, photo, round }: { name: string; photo?: string | null; round?: boolean }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <span
      className={cx("grid size-11 shrink-0 place-items-center overflow-hidden bg-[#dcf1e8] bg-cover bg-center text-[15px] font-bold text-[#0f6a4d]", round ? "rounded-full" : "rounded-xl")}
      style={photo ? { backgroundImage: `url(${photo})` } : undefined}
    >
      {photo ? "" : initials}
    </span>
  );
}
