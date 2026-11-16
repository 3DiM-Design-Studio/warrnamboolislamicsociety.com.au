import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo-mark";

/** The box every sign-in style page sits in. */
export const authCardClass = "grid w-[min(380px,calc(100vw-2rem))] gap-4 rounded-[18px] border border-border bg-card p-8";

export function AuthHeader() {
  return (
    <div className="flex items-center gap-3 font-bold">
      <LogoMark className="size-11" src="/admin-logo.png" />
      <span className="leading-tight">
        WIS Admin
        <small className="block text-[11.5px] font-normal text-muted">Warrnambool Islamic Society</small>
      </span>
    </div>
  );
}

export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-content-center justify-items-center gap-5 bg-background px-4 py-10">
      {children}
      <p className="text-[13px] text-muted">
        Powered by <b className="font-semibold text-foreground">3DiM Design Studio</b>
      </p>
    </div>
  );
}

/** A short message above a form: green for good news, red for a problem. */
export function Notice({ tone, children }: { tone: "good" | "bad"; children: ReactNode }) {
  return (
    <p role={tone === "bad" ? "alert" : "status"} className={`rounded-xl px-3.5 py-2.5 text-sm leading-snug ${tone === "good" ? "bg-[#dcf1e8] text-[#0f4f3a]" : "bg-[#fbe4e1] text-[#8a1f17]"}`}>
      {children}
    </p>
  );
}
