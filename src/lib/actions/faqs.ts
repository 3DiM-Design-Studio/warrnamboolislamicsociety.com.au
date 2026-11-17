"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, fieldErrors, ok, str } from "@/lib/actions/helpers";
import { TAGS } from "@/lib/tags";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  page: z.enum(["home", "donate"]),
  question: z.string().trim().min(1, "Please type the question.").max(300, "Please keep the question under 300 letters."),
  answer: z.string().trim().min(1, "Please type the answer.").max(2000, "Please keep the answer under 2000 letters."),
});

export async function saveFaq(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const parsed = schema.safeParse({ page: str(fd, "page"), question: str(fd, "question"), answer: str(fd, "answer") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));
  const { page, question, answer } = parsed.data;

  if (id) {
    const { error } = await supabase.from("faqs").update({ question, answer }).eq("id", id);
    if (error) return fail(dbError(error));
  } else {
    // A new question goes to the end of its page's list.
    const { data: last } = await supabase.from("faqs").select("sort_order").eq("page", page).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await supabase.from("faqs").insert({ page, question, answer, sort_order: (last?.sort_order ?? 0) + 10 });
    if (error) return fail(dbError(error));
  }
  updateTag(TAGS.faqs);
  return ok("Saved");
}

export async function deleteFaq(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return fail(dbError(error));
  updateTag(TAGS.faqs);
  return ok("Question deleted");
}

/** Swaps a question with its neighbour on the same page. direction: -1 moves up, 1 moves down. */
export async function moveFaq(id: string, direction: -1 | 1): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data: me } = await supabase.from("faqs").select("page").eq("id", id).maybeSingle();
  if (!me) return fail("That question could not be found.");
  const { data, error } = await supabase.from("faqs").select("id,sort_order").eq("page", me.page).order("sort_order", { ascending: true });
  if (error || !data) return fail(dbError(error ?? { message: "" }));
  const i = data.findIndex((r) => r.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= data.length) return fail("It cannot move any further.");
  // Renumber the whole list so ties can never leave the order unclear.
  const order = data.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  for (let n = 0; n < order.length; n++) {
    const { error: e } = await supabase.from("faqs").update({ sort_order: (n + 1) * 10 }).eq("id", order[n]);
    if (e) return fail(dbError(e));
  }
  updateTag(TAGS.faqs);
  return ok("Order saved");
}
