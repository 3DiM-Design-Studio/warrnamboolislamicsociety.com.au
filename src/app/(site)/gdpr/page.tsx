import Link from "next/link";
import { LegalMail, LegalPage, legalLi, legalLink, type LegalSection } from "@/components/legal-page";
import { site } from "@/content/site";

export const metadata = {
  title: "Your Data Rights (GDPR)",
  description: "Your rights over your personal data under the GDPR and how to use them with Warrnambool Islamic Society.",
};

const UPDATED = "18 November 2026";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About this page",
    body: (
      <>
        <p>
          The General Data Protection Regulation (GDPR) is a European law that gives people control over their personal data. {site.name} is based in Warrnambool, Victoria, and mainly serves our local
          community, so the Australian <em>Privacy Act 1988</em> is the main law that applies to us. Our <Link className={legalLink} href="/privacy-policy">privacy policy</Link> explains that.
        </p>
        <p>
          We know that supporters, members and donors sometimes live overseas, for example in Europe or the United Kingdom. <strong>So we give everyone the rights on this page, wherever you live.</strong>
        </p>
      </>
    ),
  },
  {
    id: "controller",
    title: "Who is responsible for your data",
    body: (
      <p>
        {site.name} decides why and how your personal data is used, so we are the “controller”. Contact us at <LegalMail />. We are a small volunteer-run charity and do not have a Data Protection Officer, so
        the committee looks after privacy requests.
      </p>
    ),
  },
  {
    id: "why",
    title: "Why we may use your data",
    body: (
      <>
        <p>The law says we need a good reason, called a “lawful basis”, for each use. Ours are:</p>
        <ul className={legalLi}>
          <li>
            <strong>To do what you ask (contract).</strong> Taking your membership or donation payment, sending your receipt and keeping your member record.
          </li>
          <li>
            <strong>To follow the law (legal duty).</strong> Keeping donation records for tax and charity rules, usually for seven years.
          </li>
          <li>
            <strong>Our legitimate interests.</strong> Replying to your messages, keeping the website secure and looking after our community. We use your data only in ways you would reasonably expect.
          </li>
          <li>
            <strong>Your consent.</strong> Newsletter and event emails, and counting visits with Google Analytics. You can take your consent back at any time.
          </li>
        </ul>
        <p>
          The details of what we collect are in the <Link className={legalLink} href="/privacy-policy#what-we-collect">privacy policy</Link>. We do not sell your data, and we do not make decisions about you
          using automated profiling.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <ul className={legalLi}>
          <li>
            <strong>Be informed.</strong> To know what we do with your data. That is what our policies are for.
          </li>
          <li>
            <strong>Access.</strong> To ask for a copy of the data we hold about you.
          </li>
          <li>
            <strong>Correction.</strong> To ask us to fix data that is wrong or incomplete.
          </li>
          <li>
            <strong>Erasure (“right to be forgotten”).</strong> To ask us to delete your data. We may have to keep some of it, for example donation records the tax law says we must keep. We will tell you if so.
          </li>
          <li>
            <strong>Restriction.</strong> To ask us to pause using your data while a question about it is settled.
          </li>
          <li>
            <strong>Portability.</strong> To ask for the data you gave us in a common file, such as a spreadsheet, so you can take it elsewhere.
          </li>
          <li>
            <strong>Object.</strong> To tell us to stop using your data for our legitimate interests or for emails.
          </li>
          <li>
            <strong>Withdraw consent.</strong> To say “no” again at any time. Press “Unsubscribe” in any email, or change your visit-counting choice on our{" "}
            <Link className={legalLink} href="/cookie-policy#choice">cookie policy</Link> page. Withdrawing does not affect what we did before.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use-rights",
    title: "How to use your rights",
    body: (
      <>
        <p>
          Email <LegalMail /> with the subject “My data”. Tell us your name and the email address you used with us, and what you would like. It helps us keep your information safe if we ask you to confirm
          who you are first.
        </p>
        <p>
          We reply <strong>within 30 days</strong>. It is free. If a request is very large or repeated, we will tell you why we need more time.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share data with, and where it goes",
    body: (
      <>
        <p>We share data only with companies that help us run the website, and only for that job:</p>
        <ul className={legalLi}>
          <li>Stripe for card payments.</li>
          <li>Supabase for our database.</li>
          <li>Vercel for hosting.</li>
          <li>Google for our email and, if you agree, Google Analytics.</li>
        </ul>
        <p>
          Some of these companies keep data on servers outside Australia and the European Economic Area, including in the United States. Where data leaves Europe, we rely on these companies’ standard
          contract terms and safeguards. We do not share your data with anyone else, except when the law requires it.
        </p>
      </>
    ),
  },
  {
    id: "keeping",
    title: "How long we keep it",
    body: (
      <p>
        Donation records: at least seven years. Membership details: while you are a member and a reasonable time after. Messages: only as long as needed to help you. Newsletter email addresses: until you
        unsubscribe. After that, we delete the data.
      </p>
    ),
  },
  {
    id: "breach",
    title: "If something goes wrong",
    body: (
      <p>
        If personal data is ever lost or seen by someone who should not see it, and it is likely to harm you, we will tell you and the right authority as soon as we can, and explain what you can do.
      </p>
    ),
  },
  {
    id: "complaint",
    title: "Making a complaint",
    body: (
      <>
        <p>Please talk to us first. We will try to put it right quickly. You also have the right to complain to a data protection authority:</p>
        <ul className={legalLi}>
          <li>
            In Australia: the{" "}
            <a className={legalLink} href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
              Office of the Australian Information Commissioner
            </a>
            .
          </li>
          <li>
            In the European Union: the authority in the country where you live. A list is at{" "}
            <a className={legalLink} href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">
              edpb.europa.eu
            </a>
            .
          </li>
          <li>
            In the United Kingdom: the{" "}
            <a className={legalLink} href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              Information Commissioner’s Office
            </a>
            .
          </li>
        </ul>
      </>
    ),
  },
];

export default function Gdpr() {
  return (
    <LegalPage
      current="/gdpr"
      title="Your Data Rights (GDPR)"
      intro={`Last updated ${UPDATED}. This page explains your rights over your personal data, in plain words, and how to use them.`}
      sections={sections}
    />
  );
}
