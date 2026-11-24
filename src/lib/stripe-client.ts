import { loadStripe, type Stripe } from "@stripe/stripe-js";

let started: Promise<Stripe | null> | null = null;
const start = () => (started ??= loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""));

/**
 * Stripe's script is large and keeps a phone busy for a moment while it starts. Instead of loading it the instant the page
 * opens, it starts once the page has finished loading and the browser has a quiet moment (at the latest after 2.5 seconds).
 * The card field simply appears a moment later, and the page above it stays smooth.
 */
export const stripePromise: Promise<Stripe | null> = new Promise((resolve) => {
  if (typeof window === "undefined") return;
  const go = () => resolve(start());
  const quiet = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 2500 });
    else setTimeout(go, 800);
  };
  if (document.readyState === "complete") quiet();
  else window.addEventListener("load", quiet, { once: true });
});
