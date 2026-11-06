"use client";

import { useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { Button, Field, inputClass, useToast } from "@/components/admin/ui";

const MAX_WIDTH = 1200;

/** Shrinks the picture in the browser first, so uploads are quick and photos stay light. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const width = Math.min(MAX_WIDTH, bitmap.width);
  const height = Math.round((bitmap.height * width) / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.82));
}

/** Photo picker. Uploads straight to Supabase Storage with the admin's own login and fills a hidden field. */
export function PhotoField({ name = "photo_url", defaultValue = "", label = "Photo (optional)" }: { name?: string; defaultValue?: string | null; label?: string }) {
  const toast = useToast();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please choose a picture file.");
      return;
    }
    setBusy(true);
    try {
      const blob = await shrink(file);
      const supabase = createBrowserSupabase();
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      setUrl(supabase.storage.from("photos").getPublicUrl(path).data.publicUrl);
    } catch {
      toast("The photo could not be uploaded. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-28 w-auto max-w-full rounded-xl border border-border object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept="image/*" disabled={busy} onChange={(e) => onPick(e.target.files?.[0])} className={inputClass + " cursor-pointer text-sm"} />
        {url && (
          <Button small onClick={() => setUrl("")}>
            Remove photo
          </Button>
        )}
      </div>
      {busy && <span className="text-[13px] text-muted">Uploading...</span>}
    </Field>
  );
}
