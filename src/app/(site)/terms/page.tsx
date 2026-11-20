import Link from "next/link";
import { LegalMail, LegalPage, legalLi, legalLink, type LegalSection } from "@/components/legal-page";
import { charity, site } from "@/content/site";

export const metadata = {
  title: "Terms of Use",
  description: "The simple rules for using the Warrnambool Islamic Society website, making donations and joining as a member.",
};

const UPDATED = "20 November 2026";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        This website is run by {site.name} (“WIS”, “we”, “us”), registered with the ACNC as {charity.legalName}, ABN {charity.abn}. By using this website you agree to these simple terms. If you
        do not agree, please do not use it.
      </p>
    ),
  },
  {
    id: "using",
    title: "Using the website",
    body: (
      <ul className={legalLi}>
        <li>You may read, share and link to our pages for personal and community use.</li>
        <li>Please do not misuse the website: no attempts to break in, overload it, copy it in bulk, or send spam through our forms.</li>
        <li>The committee area is for approved committee members only.</li>
        <li>Give us true information in our forms, and only information you have the right to share.</li>
      </ul>
    ),
  },
  {
    id: "donations",
    title: "Donations",
    body: (
      <>
        <p>
          Donations are gifts to the society’s community work and its plan to build a place of worship. Payments are taken securely by Stripe. We email a receipt if you ask for one.
        </p>
        <p>
          Monthly donations repeat each month until you ask us to stop. Email <LegalMail /> any time to cancel. If you think a payment was made by mistake, contact us as soon as you can and we
          will look into it.
        </p>
        <p>We do not promise that a donation is tax-deductible. If you need a tax receipt, please ask the committee first.</p>
      </>
    ),
  },
  {
    id: "membership",
    title: "Membership",
    body: (
      <p>
        Joining as a member means you give us your contact details and pay the amount you chose. The details are used to keep the member list and to contact you about the society, as explained in
        our{" "}
        <Link className={legalLink} href="/privacy-policy">
          privacy policy
        </Link>
        . The committee looks after membership matters and may ask for more information to confirm a membership.
      </p>
    ),
  },
  {
    id: "content",
    title: "Our content and yours",
    body: (
      <p>
        The words, pictures and design on this website belong to the society or to the people who gave them to us. Please ask before using them for anything other than sharing our pages.
        Prayer times, event details and news are given in good faith. Please check with the society if something matters to you, for example before travelling to an event.
      </p>
    ),
  },
  {
    id: "links",
    title: "Links to other websites",
    body: <p>Some pages link to other websites. We do not control them and are not responsible for what they say or do.</p>,
  },
  {
    id: "liability",
    title: "Our responsibility",
    body: (
      <p>
        We work hard to keep this website correct and available, but we cannot promise it will always be free of errors or interruptions. To the extent the law allows, we are not responsible for
        losses caused by using the website. Nothing here limits your rights under Australian Consumer Law.
      </p>
    ),
  },
  {
    id: "law",
    title: "Changes and the law",
    body: (
      <p>
        We may update these terms, and the date at the top shows the latest change. These terms follow the laws of Victoria, Australia. For questions, email <LegalMail /> or see our{" "}
        <Link className={legalLink} href="/contact">
          contact page
        </Link>
        .
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of Use"
      intro={`Last updated ${UPDATED}. The simple rules for using this website, giving donations and joining as a member.`}
      sections={sections}
    />
  );
}
