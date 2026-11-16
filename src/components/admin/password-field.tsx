"use client";

import { useId, useState } from "react";
import { inputClass } from "@/components/admin/ui";

/** A password box with a Show / Hide button, so people can check what they typed. */
export function PasswordField({ label, name, error, hint, autoComplete, minLength }: { label: string; name: string; error?: string; hint?: string; autoComplete: string; minLength?: number }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="grid gap-1.5 text-sm">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <div className="relative">
        <input id={id} name={name} type={show ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete} className={`${inputClass} pr-[4.5rem]`} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted transition hover:bg-background hover:text-foreground"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && !error && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] text-[#b3261e]">{error}</span>}
    </div>
  );
}
