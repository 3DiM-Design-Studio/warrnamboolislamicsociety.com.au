import type { ReactNode } from "react";
import { AnalyticsChoiceButton } from "@/components/analytics-consent";
import { PageShell } from "@/components/page-shell";
import { site } from "@/content/site";

export const metadata = {
  title: "Privacy Policy",
  description: "How Warrnambool Islamic Society collects, uses and protects your personal information.",
};

const UPDATED = "18 November 2026";

const li = "list-disc space-y-1.5 pl-5";
const link = "font-semibold underline underline-offset-2";

function Mail() {
  return (
    <a className={link} href={`mailto:${site.email}`}>
      {site.email}
    </a>
  );
}

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        {site.name} (“WIS”, “we”, “us”) is a not-for-profit community organisation in Warrnambool, Victoria, registered as a charity with the Australian Charities and Not-for-profits
        Commission (ACNC). This policy explains what personal information we collect through this website, why we collect it, who can see it, and how you can ask us to see, correct or
        remove it. We follow the Australian Privacy Principles in the <em>Privacy Act 1988</em>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect and why",
    body: (
      <ul className={li}>
        <li>
          <strong>Contact form.</strong> Your name, email address and message. We use them to reply to you.
        </li>
        <li>
          <strong>Membership.</strong> Your name, address, phone, email, the amount you paid and, if you choose to give them, the names of your spouse and children. We use them to keep the
          member list, welcome you and contact you about the society.
        </li>
        <li>
          <strong>Donations.</strong> Your name (you can ask to be anonymous), email, phone if you give it, the amount, whether it is once or monthly, any dedication you write, and
          whether you want a receipt. We use them to record your gift, email your receipt and keep our accounts and tax records.
        </li>
        <li>
          <strong>Newsletter and event emails.</strong> Your email address, if you put it in the box at the bottom of our pages. We use it to send community news and event reminders.
          Every email has an unsubscribe link.
        </li>
        <li>
          <strong>Committee sign-in.</strong> Committee members who manage the website sign in with an email address and password. This is not used for anything else.
        </li>
        <li>
          <strong>Visits to this website.</strong> Only if you say yes in the notice we show, we use Google Analytics to count visits. It records which pages are used, the type of device
          and a rough location such as the city. We do not use it for advertising.
        </li>
      </ul>
    ),
  },
  {
    id: "payments",
    title: "Card payments",
    body: (
      <p>
        Donations and membership fees are paid through Stripe, a secure payment company. You type your card details into Stripe’s form. They go straight to Stripe, and{" "}
        <strong>we never see or store your card number</strong>. We receive only the result of the payment, the amount, and the contact details you gave us.
      </p>
    ),
  },
  {
    id: "who-sees",
    title: "Who can see your information",
    body: (
      <>
        <p>
          Your information is seen only by the few committee members who look after the website, members, donations and messages. <strong>We do not sell your information</strong>, and we do not
          share it for marketing.
        </p>
        <p className="mt-3">We use trusted companies to run the website. They handle your information only to provide their service to us:</p>
        <ul className={`${li} mt-2`}>
          <li>Stripe, to take card payments.</li>
          <li>Supabase, which stores our website database.</li>
          <li>Vercel, which hosts the website.</li>
          <li>Google, which provides the email service we send receipts and replies through, and Google Analytics if you agree to visit counting.</li>
        </ul>
        <p className="mt-3">
          Some of these companies store information on servers outside Australia, including in the United States. We choose providers that protect information to a high standard. We may also
          share information when the law requires it, for example to the Australian Taxation Office or the ACNC.
        </p>
      </>
    ),
  },
  {
    id: "anonymous",
    title: "Anonymous donations",
    body: (
      <p>
        If you tick “Make my donation anonymous”, your name is never shown on a public page. The treasurer and committee still hold the details you gave us, because we need them for our accounts
        and your receipt.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and visit counting",
    body: (
      <>
        <p>
          When you first visit, we ask whether we may count visits with Google Analytics. Counting starts only if you say yes. Your choice is remembered in your browser. You can change it
          at any time here:
        </p>
        <div className="mt-3 rounded-2xl bg-card p-4">
          <AnalyticsChoiceButton />
        </div>
        <p className="mt-3">The committee sign-in page uses an essential cookie to keep committee members signed in. It is not used to track you.</p>
      </>
    ),
  },
  {
    id: "keeping",
    title: "How long we keep it, and how we protect it",
    body: (
      <>
        <p>
          We keep donation records for at least seven years, as required for charity and tax records. We keep membership details while you are a member and for a reasonable time after.
          Messages are kept only as long as we need them to help you. Newsletter addresses are kept until you unsubscribe. When we no longer need information and the law does not require us to
          keep it, we delete it.
        </p>
        <p className="mt-3">
          The website uses a secure (HTTPS) connection. Access to the committee area needs a personal sign-in, and the information is not open to the public.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights, and how to complain",
    body: (
      <>
        <p>
          You can ask to see the information we hold about you, ask us to correct it, or ask us to delete it. Email <Mail /> and we will reply within 30 days. To stop our emails at any
          time, press “Unsubscribe” in any email.
        </p>
        <p className="mt-3">
          If you think we have handled your information badly and we have not fixed it, you can complain to the Office of the Australian Information Commissioner at{" "}
          <a className={link} href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
            oaic.gov.au
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Our forms are for adults. If a parent or guardian gives us the names of their children on the membership form, we use them only for the family’s membership record. Parents can ask us to
        remove them at any time.
      </p>
    ),
  },
  {
    id: "other-sites",
    title: "Links to other websites",
    body: <p>Some pages link to other websites, such as Stripe, Google Maps, WhatsApp and Facebook. They have their own privacy policies, and we are not responsible for them.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We may update this policy from time to time. The date at the top of this page shows when it was last changed.</p>,
  },
];

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy" intro={`Last updated ${UPDATED}. This page explains in plain words how we look after your personal information.`}>
      <nav aria-label="On this page" className="max-w-3xl rounded-2xl bg-card p-5">
        <p className="mb-2 text-sm font-semibold">On this page</p>
        <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="link-fx inline-block py-1">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-3xl space-y-10 pt-4">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="mb-3 text-2xl font-bold">
              {i + 1}. {s.title}
            </h2>
            <div className="space-y-3 leading-relaxed">{s.body}</div>
          </section>
        ))}

        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-xl font-bold">Questions?</h2>
          <p className="mt-2">
            Email us at <Mail /> or use our{" "}
            <a className={link} href="/contact">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
