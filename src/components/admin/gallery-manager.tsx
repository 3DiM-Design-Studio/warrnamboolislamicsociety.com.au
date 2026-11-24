"use client";

import { useEffect, useRef, useState } from "react";
import { addGalleryPhotos, deleteGalleryPhoto, discardGalleryUploads, saveGalleryPhoto, setGalleryVisible, uploadGalleryPhoto } from "@/lib/actions/gallery";
import { ALBUMS, ALBUM_KEYS, albumLabel, photoLabel, type AlbumKey } from "@/lib/gallery";
import type { GalleryRow } from "@/lib/types";
import { fmtDate, melbourneDay } from "@/components/admin/format";
import { shrinkImage } from "@/components/admin/image-shrink";
import { Icon } from "@/components/admin/icons";
import { Pager, SearchBox, filterBar, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Field, Modal, ModalActions, Switch, TextField, inputClass, useFormAction, useRunAction, useToast } from "@/components/admin/ui";

const PAGE_SIZE = 12;
const MAX_AT_ONCE = 40;

const SORTS = { newest: "Newest", oldest: "Oldest", caption: "Caption A–Z" } as const;
type SortKey = keyof typeof SORTS;

const when = (p: GalleryRow) => p.taken_on ?? melbourneDay(p.created_at);
const compare: Record<SortKey, (a: GalleryRow, b: GalleryRow) => number> = {
  newest: (a, b) => when(b).localeCompare(when(a)) || b.created_at.localeCompare(a.created_at),
  oldest: (a, b) => when(a).localeCompare(when(b)) || a.created_at.localeCompare(b.created_at),
  caption: (a, b) => a.caption.localeCompare(b.caption),
};

export function GalleryManager({ photos, today }: { photos: GalleryRow[]; today: string }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [deleting, setDeleting] = useState<GalleryRow | null>(null);
  const { run, pending } = useRunAction();

  const [query, setQuery] = useState("");
  const [album, setAlbum] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden" | "home">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const shown = photos
    .filter(
      (p) =>
        matchesSearch(query, p.caption, albumLabel(p.album)) &&
        (!album || p.album === album) &&
        (status === "all" || (status === "visible" && p.visible) || (status === "hidden" && !p.visible) || (status === "home" && p.featured && p.visible)),
    )
    .sort(compare[sort]);
  const pg = paginate(shown, page, PAGE_SIZE);
  const filtering = query !== "" || album !== "" || status !== "all";
  const clear = () =>
    change(() => {
      setQuery("");
      setAlbum("");
      setStatus("all");
    });

  const onHome = photos.filter((p) => p.featured && p.visible).length;
  const homeNote =
    onHome === 0
      ? "No photo is switched on for the Home page, so Home shows the 5 newest photos."
      : onHome <= 5
        ? `${onHome} ${onHome === 1 ? "photo is" : "photos are"} shown on the Home page.`
        : `${onHome} photos are switched on for the Home page. Home shows the newest 5 of them.`;

  return (
    <>
      <Card>
        <CardHead title="Gallery">
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} />
            Add photos
          </Button>
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">
          Photos shown on the Gallery page of the website. {homeNote} Only upload photos that the people in them have agreed to share.
        </p>

        {photos.length > 0 && (
          <div className="mb-4 grid gap-3">
            <div className={filterBar}>
              <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search captions" />
              <select aria-label="Album" value={album} onChange={(e) => change(() => setAlbum(e.target.value))} className={filterClass}>
                <option value="">All albums</option>
                {ALBUM_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ALBUMS[k]}
                  </option>
                ))}
              </select>
              <select aria-label="Show photos" value={status} onChange={(e) => change(() => setStatus(e.target.value as typeof status))} className={filterClass}>
                <option value="all">All photos</option>
                <option value="visible">On the website</option>
                <option value="hidden">Hidden</option>
                <option value="home">On the Home page</option>
              </select>
              <select aria-label="Sort photos" value={sort} onChange={(e) => change(() => setSort(e.target.value as SortKey))} className={filterClass}>
                {Object.entries(SORTS).map(([k, label]) => (
                  <option key={k} value={k}>
                    Sort: {label}
                  </option>
                ))}
              </select>
            </div>
            {filtering && (
              <div>
                <Button small onClick={clear}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}

        {photos.length === 0 ? (
          <EmptyNote>No photos yet. Press &ldquo;Add photos&rdquo; to upload the first ones.</EmptyNote>
        ) : shown.length === 0 ? (
          <EmptyNote>No photos match. Try a different search or press &ldquo;Clear filters&rdquo;.</EmptyNote>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {pg.rows.map((p) => (
                <li key={p.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="relative aspect-[4/3] bg-[#e8ece6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb_url} alt={photoLabel(p)} loading="lazy" className={`size-full object-cover ${p.visible ? "" : "opacity-50"}`} />
                    <span className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {!p.visible && <Badge tone="red">Hidden</Badge>}
                      {p.visible && p.featured && <Badge tone="gold">Home page</Badge>}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 break-words text-sm font-semibold">{p.caption || <span className="font-normal text-muted">No caption</span>}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {albumLabel(p.album)} &middot; {fmtDate(when(p))}
                      </p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button small onClick={() => setEditing(p)}>
                        Edit
                      </Button>
                      <Button small disabled={pending} onClick={() => run(() => setGalleryVisible(p.id, !p.visible))}>
                        {p.visible ? "Hide" : "Show"}
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(p)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add photos">
        {adding && <AddPhotos today={today} onClose={() => setAdding(false)} />}
      </Modal>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit photo">
        {editing && <EditPhoto key={editing.id} photo={editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete this photo${deleting.caption ? ` ("${deleting.caption}")` : ""}? This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deleteGalleryPhoto(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

type Item = {
  key: string;
  name: string;
  preview: string;
  status: "uploading" | "done" | "error";
  error?: string;
  url?: string;
  thumb?: string;
  width?: number;
  height?: number;
  caption: string;
};

function AddPhotos({ today, onClose }: { today: string; onClose: () => void }) {
  const toast = useToast();
  const { run, pending } = useRunAction();
  const input = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState<AlbumKey>("community");
  const [takenOn, setTakenOn] = useState("");
  const [featured, setFeatured] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const saved = useRef(false);
  const live = useRef<Item[]>([]);
  useEffect(() => {
    live.current = items;
  });
  // Previews are temporary addresses made in the browser. Free them when this window closes.
  useEffect(
    () => () => {
      live.current.forEach((i) => URL.revokeObjectURL(i.preview));
    },
    [],
  );

  const patch = (key: string, change: Partial<Item>) => setItems((all) => all.map((i) => (i.key === key ? { ...i, ...change } : i)));

  async function uploadOne(key: string, file: File) {
    try {
      const blob = await shrinkImage(file);
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      const r = await uploadGalleryPhoto(fd);
      patch(key, r.ok ? { status: "done", url: r.url, thumb: r.thumb, width: r.width, height: r.height } : { status: "error", error: r.message });
    } catch {
      patch(key, { status: "error", error: "This picture could not be read. Please save it as a JPEG or PNG and try again." });
    }
  }

  function onPick(list: FileList | null) {
    if (!list || list.length === 0) return;
    const room = MAX_AT_ONCE - items.length;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (files.length < list.length) toast("Some files were skipped because they are not pictures.");
    if (files.length > room) toast(`You can add ${MAX_AT_ONCE} photos at a time. The first ${Math.max(room, 0)} were used.`);
    const fresh = files.slice(0, Math.max(room, 0)).map((file) => ({ key: crypto.randomUUID(), file }));
    if (fresh.length === 0) return;
    setItems((all) => [...all, ...fresh.map(({ key, file }): Item => ({ key, name: file.name, preview: URL.createObjectURL(file), status: "uploading", caption: "" }))]);
    // Two at a time keeps the phone or computer responsive.
    let next = 0;
    const worker = async () => {
      while (next < fresh.length) {
        const f = fresh[next++];
        await uploadOne(f.key, f.file);
      }
    };
    void Promise.all([worker(), worker()]);
    if (input.current) input.current.value = "";
  }

  function remove(item: Item) {
    URL.revokeObjectURL(item.preview);
    setItems((all) => all.filter((i) => i.key !== item.key));
    if (item.url && item.thumb) void discardGalleryUploads([item.url, item.thumb]);
  }

  function cancel() {
    const urls = items.flatMap((i) => (i.url && i.thumb ? [i.url, i.thumb] : []));
    if (!saved.current && urls.length > 0) void discardGalleryUploads(urls);
    onClose();
  }

  const done = items.filter((i) => i.status === "done");
  const uploading = items.some((i) => i.status === "uploading");
  const canSave = done.length > 0 && !uploading && !pending;

  function save() {
    run(
      () =>
        addGalleryPhotos({
          album,
          taken_on: takenOn,
          featured,
          items: done.map((i) => ({ url: i.url!, thumb: i.thumb!, width: i.width!, height: i.height!, caption: i.caption })),
        }),
      () => {
        saved.current = true;
        onClose();
      },
    );
  }

  return (
    <div className="grid gap-4">
      <p className="rounded-xl bg-[#fff6dc] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#5b4300]">
        Only upload photos that the people in them have agreed to share. Be careful with photos of children, and do not add private occasions such as funerals without the family&rsquo;s written permission.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Album">
          <select value={album} onChange={(e) => setAlbum(e.target.value as AlbumKey)} className={inputClass}>
            {ALBUM_KEYS.map((k) => (
              <option key={k} value={k}>
                {ALBUMS[k]}
              </option>
            ))}
          </select>
        </Field>
        <TextField label="Date of the photos (optional)" type="date" value={takenOn} max={today} onChange={(e) => setTakenOn(e.target.value)} />
      </div>
      <Switch label="Show these photos on the Home page" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />

      <Field label="Photos" hint="Pick one or many pictures. They are made web-sized for you.">
        <input ref={input} type="file" accept="image/*" multiple onChange={(e) => onPick(e.target.files)} className={inputClass + " cursor-pointer text-sm"} />
      </Field>

      {items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((i) => (
            <li key={i.key} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-xl border border-border p-2.5 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.preview} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <div className="grid min-w-0 content-start gap-1.5">
                {i.status === "error" ? (
                  <p role="alert" className="text-[13px] text-[#b3261e]">
                    {i.name}: {i.error}
                  </p>
                ) : (
                  <input
                    aria-label={`Caption (optional) for ${i.name}`}
                    value={i.caption}
                    maxLength={160}
                    onChange={(e) => patch(i.key, { caption: e.target.value })}
                    placeholder="Caption (optional), for example: Friday prayer in the musallah"
                    className={inputClass + " py-2! text-sm"}
                  />
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                  {i.status === "uploading" && <span>Uploading&hellip;</span>}
                  {i.status === "done" && <span className="text-[#0f6a4d]">Ready</span>}
                  <button type="button" onClick={() => remove(i)} className="font-semibold underline underline-offset-2">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={cancel}>Cancel</Button>
        <Button variant="primary" disabled={!canSave} onClick={save}>
          {pending ? "Saving..." : done.length > 1 ? `Save ${done.length} photos` : "Save photo"}
        </Button>
      </div>
    </div>
  );
}

function EditPhoto({ photo, onClose }: { photo: GalleryRow; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveGalleryPhoto, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={photo.id} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.thumb_url} alt={photoLabel(photo)} className="max-h-56 w-auto max-w-full rounded-xl border border-border object-cover" />
      <TextField label="Caption (optional)" name="caption" defaultValue={photo.caption} error={e.caption} maxLength={160} hint="A short line shown under the photo. It also helps people who cannot see the picture." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Album" error={e.album}>
          <select name="album" defaultValue={photo.album} className={inputClass}>
            {ALBUM_KEYS.map((k) => (
              <option key={k} value={k}>
                {ALBUMS[k]}
              </option>
            ))}
            {!ALBUM_KEYS.includes(photo.album as AlbumKey) && <option value={photo.album}>Other</option>}
          </select>
        </Field>
        <TextField label="Date of the photo" name="taken_on" type="date" defaultValue={photo.taken_on ?? ""} error={e.taken_on} />
      </div>
      <Switch label="Show on the Home page" name="featured" defaultChecked={photo.featured} />
      <Switch label="Show on the website" name="visible" defaultChecked={photo.visible} />
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
