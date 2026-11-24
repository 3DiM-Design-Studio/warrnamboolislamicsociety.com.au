"use server";

import { updateTag } from "next/cache";
import sharp, { type OutputInfo } from "sharp";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { DATE, dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { isAlbum } from "@/lib/gallery";
import { supabaseUrl } from "@/lib/supabase/anon";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const FOLDER = "gallery/";
const PHOTO_PREFIX = `${supabaseUrl}/storage/v1/object/public/photos/${FOLDER}`;
const MAX_UPLOAD = 4 * 1024 * 1024; // the host accepts about 4.5 MB per request, and the browser has already shrunk the picture

export type UploadResult = { ok: true; url: string; thumb: string; width: number; height: number } | { ok: false; message: string };

/**
 * Takes one picture from the admin's browser, straightens it, shrinks it to a web size, removes hidden details such as
 * the place it was taken, and saves a large and a small copy. Returns the two addresses.
 */
export async function uploadGalleryPhoto(fd: FormData): Promise<UploadResult> {
  const { supabase } = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Please choose a picture." };
  if (!file.type.startsWith("image/")) return { ok: false, message: "That file is not a picture." };
  if (file.size > MAX_UPLOAD) return { ok: false, message: "That picture is too big. Please choose a smaller one." };

  let main: { data: Buffer; info: OutputInfo };
  let small: Buffer;
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "none" }).rotate(); // .rotate() applies the phone's orientation; output has no extra metadata
    main = await source.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    small = await source.clone().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toBuffer();
  } catch {
    return { ok: false, message: "This picture could not be read. Please save it as a JPEG or PNG and try again." };
  }

  const id = crypto.randomUUID();
  const bucket = supabase.storage.from("photos");
  const options = { contentType: "image/jpeg", cacheControl: "31536000" };
  const a = await bucket.upload(`${FOLDER}${id}.jpg`, main.data, options);
  if (a.error) return { ok: false, message: "The picture could not be saved. Please try again." };
  const b = await bucket.upload(`${FOLDER}${id}-thumb.jpg`, small, options);
  if (b.error) {
    await bucket.remove([`${FOLDER}${id}.jpg`]);
    return { ok: false, message: "The picture could not be saved. Please try again." };
  }
  return {
    ok: true,
    url: bucket.getPublicUrl(`${FOLDER}${id}.jpg`).data.publicUrl,
    thumb: bucket.getPublicUrl(`${FOLDER}${id}-thumb.jpg`).data.publicUrl,
    width: main.info.width,
    height: main.info.height,
  };
}

/** The file path inside the "photos" storage folder, or null if the address is not one of ours. */
function pathOf(url: string) {
  return url.startsWith(PHOTO_PREFIX) ? `${FOLDER}${url.slice(PHOTO_PREFIX.length)}` : null;
}

async function removeFiles(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], urls: string[]) {
  const paths = urls.map(pathOf).filter((p): p is string => p !== null);
  if (paths.length > 0) await supabase.storage.from("photos").remove(paths);
}

const itemSchema = z.object({
  url: z.string().startsWith(PHOTO_PREFIX),
  thumb: z.string().startsWith(PHOTO_PREFIX),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  caption: z.string().trim().max(160, "A caption can have 160 letters at most."),
});

const addSchema = z.object({
  album: z.string().refine(isAlbum, "Please choose an album."),
  taken_on: z.string().regex(DATE, "Please choose a valid date.").or(z.literal("")),
  featured: z.boolean(),
  items: z.array(itemSchema).min(1, "Please add at least one photo.").max(40, "Please add up to 40 photos at a time."),
});

export type NewPhotos = z.input<typeof addSchema>;

/** Saves photos that were already uploaded, with their captions. */
export async function addGalleryPhotos(input: NewPhotos): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the photos.");
  const { album, taken_on, featured, items } = parsed.data;
  const rows = items.map((i) => ({
    caption: i.caption,
    album,
    photo_url: i.url,
    thumb_url: i.thumb,
    width: i.width,
    height: i.height,
    taken_on: taken_on || null,
    featured,
    visible: true,
  }));
  const { error } = await supabase.from("gallery_photos").insert(rows);
  if (error) return fail(dbError(error));
  updateTag(TAGS.gallery);
  return ok(rows.length === 1 ? "Photo added" : `${rows.length} photos added`);
}

/** Removes uploaded pictures that were never saved (the admin pressed Cancel or took one out of the list). */
export async function discardGalleryUploads(urls: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  await removeFiles(supabase, urls.filter((u) => typeof u === "string").slice(0, 80));
}

const editSchema = z.object({
  caption: z.string().trim().max(160, "A caption can have 160 letters at most."),
  album: z.string().refine(isAlbum, "Please choose an album."),
  taken_on: z.string().regex(DATE, "Please choose a valid date.").or(z.literal("")),
});

export async function saveGalleryPhoto(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (!id) return fail("Something went wrong. Please close this and try again.");
  const parsed = editSchema.safeParse({ caption: str(fd, "caption"), album: str(fd, "album"), taken_on: str(fd, "taken_on") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const { error } = await supabase
    .from("gallery_photos")
    .update({ caption: parsed.data.caption, album: parsed.data.album, taken_on: parsed.data.taken_on || null, featured: flag(fd, "featured"), visible: flag(fd, "visible") })
    .eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.gallery);
  return ok("Saved");
}

/** Hides or shows one photo on the website straight away. */
export async function setGalleryVisible(id: string, visible: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("gallery_photos").update({ visible }).eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.gallery);
  return ok(visible ? "Photo is on the website again" : "Photo hidden from the website");
}

export async function deleteGalleryPhoto(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("gallery_photos").select("photo_url,thumb_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return fail(dbError(error));
  if (data) await removeFiles(supabase, [data.photo_url, data.thumb_url]);
  updateTag(TAGS.gallery);
  return ok("Photo deleted");
}
