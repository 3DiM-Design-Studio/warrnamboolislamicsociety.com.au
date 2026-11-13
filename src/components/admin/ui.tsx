"use client";

// Small set of building blocks for the admin panel, styled to match the approved prototype.
import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { ActionState } from "@/lib/types";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ---------- toast ---------- */
type ToastFn = (message: string, sub?: string) => void;
const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback<ToastFn>((message, sub) => {
    setToast({ message, sub });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  return (
    <ToastContext value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
        {toast && (
          <div className="rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white shadow-lg">
            {toast.message}
            {toast.sub && <span className="ml-3 font-medium text-accent">{toast.sub}</span>}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

/* ---------- buttons ---------- */
type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger"; small?: boolean };
export function Button({ variant = "ghost", small, className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        small ? "px-3.5 py-2.5 text-[13px] sm:py-1.5" : "px-5 py-2.5 text-sm",
        variant === "primary" && "bg-brand-gradient text-brand-dark hover:brightness-95",
        variant === "ghost" && "border border-[#cfd1c7] bg-white hover:border-brand-dark",
        variant === "danger" && "border border-[#cfd1c7] bg-white text-[#b3261e] hover:border-[#b3261e] hover:bg-[#fbe5e3]",
        className,
      )}
    />
  );
}

export function Badge({ tone = "grey", children }: { tone?: "grey" | "green" | "gold" | "red"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "grey" && "bg-[#ecece5] text-muted",
        tone === "green" && "bg-[#dcf1e8] text-[#0f6a4d]",
        tone === "gold" && "bg-[#f6edd6] text-[#8a6410]",
        tone === "red" && "bg-[#fbe4e1] text-[#b3261e]",
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cx("min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6", className)} />;
}

export function CardHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-bold">{title}</h2>
      {children}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-muted">{children}</p>;
}

/* ---------- form fields ---------- */
export const inputClass =
  "w-full rounded-xl border border-[#cfd1c7] bg-white px-3.5 py-2.5 text-base outline-none focus:border-[#0f8a63] sm:text-[15px] focus:ring-4 focus:ring-[#dcf1e8]";

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] text-[#b3261e]">{error}</span>}
    </label>
  );
}

export function TextField({ label, error, hint, className, ...props }: ComponentProps<"input"> & { label: string; error?: string; hint?: string }) {
  return (
    <Field label={label} error={error} hint={hint}>
      <input {...props} className={cx(inputClass, className)} />
    </Field>
  );
}

export function Switch({ label, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" {...props} className="size-[18px] accent-[#0f8a63]" />
      {label}
    </label>
  );
}

/* ---------- modal (native dialog) ---------- */
export function Modal({ open, onClose, title, children, small }: { open: boolean; onClose: () => void; title: string; children: ReactNode; small?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      // The site's smooth scrolling (Lenis) would otherwise take the mouse wheel and scroll the page behind.
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/50",
        small ? "max-w-md" : "max-w-xl",
      )}
    >
      {open && (
        <div className="p-6">
          <h2 className="mb-5 text-lg font-bold">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ModalActions({ onCancel, pending, okLabel = "Save", message }: { onCancel: () => void; pending?: boolean; okLabel?: string; message?: string }) {
  return (
    <div className="mt-2 grid gap-3">
      {message && (
        <p role="alert" className="text-sm text-[#b3261e]">
          {message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving..." : okLabel}
        </Button>
      </div>
    </div>
  );
}

/* ---------- running server actions ---------- */
type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** Wraps a form server action: shows a toast and calls onDone when it worked. */
export function useFormAction(action: FormAction, onDone?: () => void, opts: { site?: boolean } = {}) {
  const site = opts.site ?? true;
  const toast = useToast();
  const [state, formAction, pending] = useActionState(action, null);
  const seen = useRef<number | null>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!state || state.at === seen.current) return;
    seen.current = state.at;
    if (state.ok) {
      toast(state.message, site ? "Website updated" : undefined);
      done.current?.();
    }
  }, [state, toast, site]);
  return { state, formAction, pending };
}

/** Runs a one-click server action (delete, approve...) and shows the result. */
export function useRunAction() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = useCallback(
    (fn: () => Promise<ActionState>, after?: () => void) => {
      start(async () => {
        const r = await fn();
        if (r) toast(r.message);
        if (r?.ok) after?.();
      });
    },
    [toast],
  );
  return { run, pending };
}

export function ConfirmDialog({
  open,
  onClose,
  message,
  confirmLabel = "Delete",
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Are you sure?" small>
      <p className="text-sm">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="danger" disabled={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
