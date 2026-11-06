"use client";

import { PaymentElement } from "@stripe/react-stripe-js";
import { CreditCard } from "lucide-react";
import MicroSlats from "@/components/MicroSlats";

// Left-hand panel of the donate and membership cards: Stripe's card field over a soft animated background.
// Must be rendered inside a Stripe <Elements> provider.
export function PaymentPanel() {
  return (
    <div className="relative isolate overflow-hidden bg-white p-6 sm:p-8 md:order-first md:rounded-tl-2xl">
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
      <PaymentFields />
    </div>
  );
}

// Stripe's payment field (card, plus Google Pay and Apple Pay where the browser offers them).
export function PaymentFields({ heading = true }: { heading?: boolean }) {
  return (
    <>
      {heading && (
        <p className="flex items-center gap-2 font-bold">
          <CreditCard className="size-5 text-[#0f8a63]" aria-hidden />
          Payment
        </p>
      )}
      <div className={heading ? "mt-5" : ""}>
        <PaymentElement
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
