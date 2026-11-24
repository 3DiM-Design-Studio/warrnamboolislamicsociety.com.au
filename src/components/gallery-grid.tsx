"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PublicPhoto } from "@/lib/content";
import { ALBUMS, ALBUM_KEYS, albumLabel, photoLabel } from "@/lib/gallery";

const STEP = 15;

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
// A link such as /gallery#p-<id> (from the Home page) opens that photo straight away.
const readHash = () => window.location.hash.replace(/^#p-/, "");

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));

/** The Gallery page: album buttons, a tidy wall of photos with their captions, and a large viewer. */
export function GalleryGrid({ photos }: { photos: PublicPhoto[] }) {
  const lenis = useLenis();
  const [album, setAlbum] = useState("");
  const [count, setCount] = useState(STEP);
  const [openId, setOpenId] = useState<string | null>(null);
  const [closedHash, setClosedHash] = useState<string | null>(null);
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const filtered = album ? photos.filter((p) => p.album === album) : photos;
  const shown = filtered.slice(0, count);

  const currentId = openId ?? (hash && hash !== closedHash ? hash : null);
  const pool = currentId && !filtered.some((p) => p.id === currentId) ? photos : filtered;
  const index = currentId ? pool.findIndex((p) => p.id === currentId) : -1;
  const photo = index >= 0 ? pool[index] : null;
  const isOpen = photo !== null;

  const close = useCallback(() => {
    setOpenId(null);
    setClosedHash(hash);
    opener.current?.focus();
  }, [hash]);
  const go = useCallback(
    (step: number) => {
      if (index < 0) return;
      setOpenId(pool[(index + step + pool.length) % pool.length].id);
    },
    [index, pool],
  );

  // While the viewer is open: the page behind stands still, and the keyboard works.
  useEffect(() => {
    if (!isOpen) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, lenis]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, go]);

  if (photos.length === 0) {
    return <p className="rounded-2xl bg-card p-6 text-muted">Photos will appear here soon. Please check back.</p>;
  }

  const albums = ALBUM_KEYS.map((k) => ({ key: k as string, label: ALBUMS[k], n: photos.filter((p) => p.album === k).length })).filter((a) => a.n > 0);

  const pick = (key: string) => {
    setAlbum(key);
    setCount(STEP);
  };
  const pill = (active: boolean) =>
    `rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-brand-dark bg-brand-dark text-white" : "border-brand-dark/25 hover:border-brand-dark"}`;

  return (
    <div>
      {albums.length > 1 && (
        <div role="group" aria-label="Choose an album" className="mb-6 flex flex-wrap gap-2">
          <button type="button" aria-pressed={album === ""} onClick={() => pick("")} className={pill(album === "")}>
            All ({photos.length})
          </button>
          {albums.map((a) => (
            <button key={a.key} type="button" aria-pressed={album === a.key} onClick={() => pick(a.key)} className={pill(album === a.key)}>
              {a.label} ({a.n})
            </button>
          ))}
        </div>
      )}

      <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {shown.map((p) => (
          <li key={p.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              id={`p-${p.id}`}
              aria-label={`Open photo: ${photoLabel(p)}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpenId(p.id);
              }}
              className="group relative block w-full overflow-hidden rounded-2xl bg-card text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumb_url}
                alt=""
                width={p.width ?? 640}
                height={p.height ?? 480}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
                style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
              />
              <span className="pointer-events-none absolute inset-0 flex items-end bg-black/60 p-3.5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="grid gap-0.5">
                  <span className="line-clamp-4 text-sm font-semibold leading-snug">{p.caption || albumLabel(p.album)}</span>
                  {p.caption && <span className="text-xs text-white/70">{albumLabel(p.album)}</span>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {filtered.length > shown.length && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setCount((c) => c + STEP)} className="btn-secondary">
            Show more photos
          </button>
        </div>
      )}

      {photo && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" data-lenis-prevent className="fixed inset-0 z-[80] flex flex-col bg-black/95 text-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-white/70" aria-live="polite">
              {index + 1} of {pool.length}
            </p>
            <button ref={closeButton} type="button" onClick={close} aria-label="Close photo" className="grid size-11 place-items-center rounded-full bg-white/15 hover:bg-white/25">
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
            {pool.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/15 hover:bg-white/25 sm:left-4">
                <ChevronLeft className="size-6" aria-hidden />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={photo.id} src={photo.photo_url} alt={photoLabel(photo)} className="max-h-full max-w-full rounded-lg object-contain" />
            {pool.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/15 hover:bg-white/25 sm:right-4">
                <ChevronRight className="size-6" aria-hidden />
              </button>
            )}
          </div>

          <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-3 text-center">
            {photo.caption && <p className="text-base font-semibold">{photo.caption}</p>}
            <p className="mt-1 text-sm text-white/65">
              {albumLabel(photo.album)}
              {photo.taken_on ? ` · ${longDate(photo.taken_on)}` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
