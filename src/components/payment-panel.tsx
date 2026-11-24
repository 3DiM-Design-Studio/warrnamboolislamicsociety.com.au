"use client";

import { PaymentElement } from "@stripe/react-stripe-js";
import { CreditCard } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import MicroSlats from "@/components/MicroSlats";
import { Skeleton } from "@/components/skeletons";

// Left-hand panel of the donate and membership cards: Stripe's card field over a soft animated background.
// Must be rendered inside a Stripe <Elements> provider.
const noSubscribe = () => () => {};
const hasMouse = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function PaymentPanel() {
  // Phones and tablets get a still, soft background. The 3D one needs a lot of power and is easy to feel as lag.
  const animated = useSyncExternalStore(noSubscribe, hasMouse, () => false);
  return (
    <div className="relative isolate overflow-hidden bg-white p-6 sm:p-8 md:order-first md:rounded-tl-2xl">
      {!animated && <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-[#c9f26b]/20 via-white to-white" />}
      {animated && (
      <div className="absolute inset-0 -z-10 opacity-50">
        <MicroSlats
          preset="swell"
          color="#c9f26b"
          glintColor="#ffffff"
          backgroundColor="transparent"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          interactive
          cursorStrength={1}
          cursorSize={40}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
          scale={1.5}
          speed={0.6}
          direction={250}
          chop={0.55}
          stretch={0}
          glint={0.3}
          contrast={1}
          perspective={0.55}
          fog={0.55}
          introDuration={1.5}
          paused={false}
          style={{}}
        />
      </div>
      )}
      <PaymentFields />
    </div>
  );
}

// Stripe's payment field (card, plus Google Pay and Apple Pay where the browser offers them).
export function PaymentFields({ heading = true }: { heading?: boolean }) {
  // Stripe's field arrives a moment after the page. Its space is kept free (with grey shapes) so nothing below it jumps.
  const [ready, setReady] = useState(false);
  return (
    <>
      {heading && (
        <p className="flex items-center gap-2 font-bold">
          <CreditCard className="size-5 text-[#0f8a63]" aria-hidden />
          Payment
        </p>
      )}
      <div className={`relative min-h-[19rem] ${heading ? "mt-5" : ""}`}>
        {!ready && (
          <div aria-hidden className="absolute inset-0 grid content-start gap-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        )}
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            fields: { billingDetails: { name: "never", email: "never" } },
            defaultValues: { billingDetails: { address: { country: "AU" } } },
            wallets: { link: "never" },
          }}
        />
      </div>
      <p className="mt-5 rounded-lg bg-white/80 p-3 text-xs text-muted">
        Payments are processed securely by Stripe. Your card details never touch
        our servers.
      </p>
    </>
  );
}
