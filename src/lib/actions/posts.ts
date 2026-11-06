"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { DATE, dbError, fail, fieldErrors, flag, ok, str } from "@/lib/actions/helpers";
import { cleanHtml, htmlToText } from "@/lib/sanitize";
import { supabaseUrl } from "@/lib/supabase/anon";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(1, "Please add a title.").max(200, "The title is too long."),
  excerpt: z.string().trim().max(400, "The summary is too long (400 letters at most)."),
  post_date: z.string().regex(DATE, "Please choose a date."),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";

const PHOTO_PREFIX = `${supabaseUrl}/storage/v1/object/public/photos/`;

export async function savePost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({ title: str(fd, "title"), excerpt: str(fd, "excerpt"), post_date: str(fd, "post_date") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  const body = cleanHtml(str(fd, "body"));
  const published = flag(fd, "published");
  const pinned = flag(fd, "pinned");
  const photo = str(fd, "photo_url");
  if (published && !htmlToText(body)) return fail("Please add some text before showing this post on the website.", { body: "Please add some text." });
  if (photo && !photo.startsWith(PHOTO_PREFIX)) return fail("That photo could not be used. Please upload it again.");

  if (pinned) {
    let q = supabase.from("posts").select("id", { count: "exact", head: true }).eq("pinned", true);
    if (id) q = q.neq("id", id);
    const { count } = await q;
    if ((count ?? 0) >= 2) return fail("Two posts are already shown first. Turn one off before choosing this one.");
  }

  const row = {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    body,
    post_date: parsed.data.post_date,
    status: published ? "published" : "draft",
    pinned,
    photo_url: photo || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    // The web address stays the same after the first save, so shared links keep working.
    const { error } = await supabase.from("posts").update(row).eq("id", id);
    if (error) return fail(dbError(error));
  } else {
    const base = slugify(parsed.data.title);
    let slug = base;
    for (let n = 2; n < 50; n++) {
      const { data } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${n}`;
    }
    const { error } = await supabase.from("posts").insert({ ...row, slug });
    if (error) return fail(dbError(error));
  }
  updateTag(TAGS.posts);
  return ok("Post saved");
}

export async function deletePost(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.posts);
  return ok("Post deleted");
}
