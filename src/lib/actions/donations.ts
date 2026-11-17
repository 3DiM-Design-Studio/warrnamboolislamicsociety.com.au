"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { dbError, fail, ok } from "@/lib/actions/helpers";
import { receiptNumber, sendDonationReceipt } from "@/lib/receipt-email";
import type { ActionState } from "@/lib/types";

export async function deleteDonation(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok("Donation deleted");
}

/** Sends the thank-you receipt again, for a donor whose email was not sent the first time. */
export async function resendDonationReceipt(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data: d, error } = await supabase
    .from("donations")
    .select("donor_name,email,amount_cents,frequency,anonymous,wants_receipt,submitted_date,payment_intent,invoice_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !d) return fail("That donation could not be found.");
  if (!d.wants_receipt) return fail("This donor did not ask for a receipt, so none was sent.");
  if (!d.email || !/^\S+@\S+\.\S+$/.test(d.email)) return fail("This donation has no valid email address to send to.");

  const sent = await sendDonationReceipt({
    to: d.email,
    name: d.donor_name || "Friend",
    amountCents: d.amount_cents,
    date: d.submitted_date,
    monthly: d.frequency === "monthly",
    receiptNo: receiptNumber(d.payment_intent, d.invoice_id),
  });
  if (!sent) return fail("The receipt could not be sent. Please check the email settings and try again.");
  return ok(`Receipt sent to ${d.email}`);
}
