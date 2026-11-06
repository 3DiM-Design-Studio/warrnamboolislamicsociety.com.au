import type { z } from "zod";
import type { ActionState } from "@/lib/types";

export const ok = (message: string): ActionState => ({ ok: true, message, at: Date.now() });

export const fail = (message: string, errors?: Record<string, string>): ActionState => ({
  ok: false,
  message,
  errors,
  at: Date.now(),
});

/** First message per field from a zod error. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
export const flag = (fd: FormData, key: string) => fd.get(key) === "on";

export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME = /^\d{2}:\d{2}$/;

/** Friendly message for a database error. */
export function dbError(error: { code?: string; message: string }): string {
  if (error.code === "42501") return "You do not have permission to do that.";
  if (error.code === "23505") return "That already exists.";
  return "Sorry, that could not be saved. Please try again.";
}
