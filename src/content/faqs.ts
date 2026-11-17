// The questions the website shows until the admin has its own list (and if the database cannot be reached).
// Once the admin saves a list under "Website info", that list is used instead.

export type FaqPage = "home" | "donate";

export const FAQ_PAGES: { key: FaqPage; label: string }[] = [
  { key: "home", label: "Home page" },
  { key: "donate", label: "Donate page" },
];

export const defaultFaqs: Record<FaqPage, { q: string; a: string }[]> = {
  home: [
    { q: "When is Jumu'ah?", a: "Jumu'ah is every Friday. The time can change by season, so check the prayer times page." },
    { q: "How can I donate?", a: "Use the donate page. Online card donations are being set up; until then contact the committee for bank details." },
    { q: "Is WIS a registered charity?", a: "Yes. Warrnambool Islamic Society is registered with the Australian Charities and Not-for-profits Commission (ACNC)." },
    { q: "How do I become a member?", a: "Visit the membership page or contact the committee and we will help you register." },
    { q: "Who can attend?", a: "Everyone. We welcome people of all backgrounds to visit and show their support." },
  ],
  donate: [
    { q: "How is my donation processed?", a: "Payments are processed securely by Stripe. Your card details are entered in a Stripe-hosted field and never reach our servers." },
    { q: "Are there any fees?", a: "Stripe charges the society its standard processing fee on each payment. We add no extra fees on top." },
    { q: "Is this donation tax-deductible?", a: "The society is registered with the ACNC. Please contact the committee to confirm whether a tax-deductible receipt is available for your gift." },
    { q: "Will I receive a receipt?", a: "Enter your email and Stripe sends a payment receipt when receipts are enabled on the society's account. You can also contact us to confirm your gift." },
    { q: "Can I cancel a monthly donation?", a: "Yes. Contact us at any time and we will cancel it for you." },
  ],
};
