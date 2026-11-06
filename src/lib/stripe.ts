import Stripe from "stripe";

let client: Stripe | undefined;

// Created on first use rather than at import, so `next build` works on a host where the secret
// key isn't set yet (the key is only needed when a payment route actually runs).
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    client ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    return Reflect.get(client, prop);
  },
});
