import { Icon, type IconName } from "@/components/admin/icons";
import { cx } from "@/components/admin/ui";
import type { Field } from "@/lib/guide-content";

/** Arrows between short steps: the quickest way to show "do this, then this". */
export function Flow({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {items.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="rounded-full bg-brand-dark px-3.5 py-2 text-[13.5px] font-semibold leading-tight text-white">{s}</span>
          {i < items.length - 1 && (
            <span aria-hidden="true" className="text-lg font-bold text-[#0f6a4d]">
              &rarr;
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Cards({ items }: { items: { icon: IconName; title: string; text: string }[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map((c) => (
        <li key={c.title} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dcf1e8] text-[#0f6a4d]">
            <Icon name={c.icon} size={20} />
          </span>
          <span className="min-w-0 leading-tight">
            <b className="block text-[14.5px]">{c.title}</b>
            <span className="mt-0.5 block text-[13px] font-semibold text-[#0f6a4d]">&rarr; {c.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Input({ f }: { f: Field }) {
  const base = "rounded-xl border border-[#cfd1c7] bg-white px-3 py-2 text-[13.5px] text-muted";
  switch (f.kind) {
    case "long":
      return <div className={cx(base, "min-h-16")}>{f.example}</div>;
    case "select":
      return (
        <div className={cx(base, "flex items-center justify-between gap-2")}>
          <span className="text-foreground">{f.example}</span>
          <Icon name="down" size={16} />
        </div>
      );
    case "photo":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#cfd1c7] bg-background px-3 py-2.5 text-[13.5px] text-muted">
          <Icon name="plus" size={16} />
          Choose a photo
        </div>
      );
    case "switch":
      return (
        <div className="flex items-center gap-3 rounded-xl border border-[#cfd1c7] bg-white px-3 py-2 text-[13.5px]">
          <span className="relative h-5 w-9 shrink-0 rounded-full bg-[#0f8a63]">
            <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
          </span>
          <span className="text-muted">{f.example}</span>
        </div>
      );
    case "date":
    case "time":
      return (
        <div className={cx(base, "flex items-center justify-between gap-2")}>
          <span className={f.example ? "text-foreground" : ""}>{f.example ?? (f.kind === "date" ? "Choose a date" : "Choose a time")}</span>
          <Icon name={f.kind === "date" ? "events" : "clock"} size={16} />
        </div>
      );
    default:
      return <div className={base}>{f.example ?? " "}</div>;
  }
}

/** A drawing of a form, plus how to open it. Needed boxes are marked so people know what they must fill in. */
export function FormMock({ title, open, fields, button = "Save" }: { title: string; open: string; fields: Field[]; button?: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-start gap-2 bg-[#dcf1e8] px-4 py-2.5 text-[13.5px] leading-snug text-[#0f4f3a]">
        <span aria-hidden="true" className="mt-px font-bold">
          &#9654;
        </span>
        <span>
          <b>How to open: </b>
          {open}
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <div role="img" aria-label={`A drawing of the ${title} form`} className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-3 text-[15px] font-bold">{title}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 p-4">
            {fields.map((f) => (
              <div key={f.label} className={cx("min-w-0", f.half ? "col-span-2 sm:col-span-1" : "col-span-2")}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-tight">{f.label}</span>
                  <span className={cx("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", f.need ? "bg-[#fbe4e1] text-[#b3261e]" : "bg-[#ecece5] text-muted")}>{f.need ? "Needed" : "Optional"}</span>
                </div>
                <Input f={f} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3 text-[13px] font-semibold">
            <span className="rounded-full border border-[#cfd1c7] bg-white px-4 py-1.5">Cancel</span>
            <span className="bg-brand-gradient rounded-full px-5 py-1.5 text-brand-dark">{button}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}

/** The popup that appears before anything is deleted. */
export function ConfirmMock({ text }: { text: string }) {
  return (
    <figure className="rounded-2xl border border-border bg-background p-3 sm:p-4">
      <div role="img" aria-label="A drawing of the question that appears before deleting" className="mx-auto max-w-[380px] rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-base font-bold">Are you sure?</p>
        <p className="mt-2 text-[14.5px] leading-relaxed">{text}</p>
        <div className="mt-5 flex justify-end gap-2 text-[13px] font-semibold">
          <span className="rounded-full border border-[#cfd1c7] bg-white px-4 py-2">No, keep it</span>
          <span className="rounded-full border border-[#b3261e] bg-[#fbe5e3] px-4 py-2 text-[#b3261e]">Yes, delete</span>
        </div>
      </div>
    </figure>
  );
}
