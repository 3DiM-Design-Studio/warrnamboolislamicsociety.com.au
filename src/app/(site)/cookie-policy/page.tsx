import Link from "next/link";
import { AnalyticsChoiceButton } from "@/components/analytics-consent";
import { LegalMail, LegalPage, legalLi, legalLink, type LegalSection } from "@/components/legal-page";
import { site } from "@/content/site";

export const metadata = {
  title: "Cookie Policy",
  description: "What cookies and similar tools Warrnambool Islamic Society uses on this website, and how to control them.",
};

const UPDATED = "18 November 2026";

const th = "px-3 py-2 text-left text-sm font-semibold";
const td = "px-3 py-3 align-top text-sm";

const sections: LegalSection[] = [
  {
    id: "what",
    title: "What are cookies?",
    body: (
      <p>
        A cookie is a tiny text file that a website saves in your browser. It lets the website remember something between pages or visits, for example that you are signed in. Similar tools, such as
        your browser’s “local storage”, do the same job. In this policy, “cookies” means both.
      </p>
    ),
  },
  {
    id: "our-promise",
    title: "Our short promise",
    body: (
      <ul className={legalLi}>
        <li>
          We use <strong>no advertising cookies</strong> and no tracking for marketing.
        </li>
        <li>
          We count visits <strong>only if you say yes</strong>, and you can change your mind at any time.
        </li>
        <li>The cookies that keep the website working need no permission, and we keep them to a minimum.</li>
      </ul>
    ),
  },
  {
    id: "essential",
    title: "Cookies that keep the website working",
    body: (
      <>
        <p>These are needed for a basic service you asked for, so they are always on. They do not follow you around the internet.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[34rem] border-collapse">
            <caption className="sr-only">Essential cookies and storage</caption>
            <thead className="bg-card">
              <tr>
                <th scope="col" className={th}>Name</th>
                <th scope="col" className={th}>Who sets it</th>
                <th scope="col" className={th}>What it does</th>
                <th scope="col" className={th}>How long</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <th scope="row" className={`${td} text-left font-semibold`}>Sign-in (sb-… cookies)</th>
                <td className={td}>Us (Supabase)</td>
                <td className={td}>Keeps committee members signed in to the admin area. Visitors never receive it.</td>
                <td className={td}>Until you sign out, or about a week</td>
              </tr>
              <tr>
                <th scope="row" className={`${td} text-left font-semibold`}>wis_analytics</th>
                <td className={td}>Us (browser storage)</td>
                <td className={td}>Remembers your Yes or No answer about counting visits, so we do not ask again.</td>
                <td className={td}>Until you clear your browser data</td>
              </tr>
              <tr>
                <th scope="row" className={`${td} text-left font-semibold`}>Payment cookies</th>
                <td className={td}>Stripe</td>
                <td className={td}>Set only on the Donate and Membership pages, to take card payments safely and to help stop fraud.</td>
                <td className={td}>Set by Stripe. See their policy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Cookies that count visits (only if you agree)",
    body: (
      <>
        <p>
          If you say yes in the notice we show, we turn on Google Analytics. It sets cookies named <strong>_ga</strong> and <strong>_ga_…</strong> that last up to two years. They tell us how many people visit,
          which pages are used, the type of device and a rough location such as the city. We use this only to improve the website. We do not use it for advertising, and we do not sell it.
        </p>
        <p>If you say no, or do nothing, these cookies are never set.</p>
      </>
    ),
  },
  {
    id: "choice",
    title: "Your choice",
    body: (
      <>
        <p>You can change your answer here at any time:</p>
        <div className="rounded-2xl bg-card p-4">
          <AnalyticsChoiceButton />
        </div>
        <p>
          Saying no does not change how the website works for you. Choosing “Stop counting my visits” turns off the counting from now on. To remove cookies that are already saved, see the next section.
        </p>
      </>
    ),
  },
  {
    id: "browser",
    title: "Controlling cookies in your browser",
    body: (
      <>
        <p>
          Every browser lets you see, block and delete cookies, usually under Settings, then Privacy. You can also browse in a private window, where cookies are deleted when you close it. If you block all
          cookies, card payments and committee sign-in may not work.
        </p>
        <p>
          Google offers a browser add-on to switch off Google Analytics on every website, at{" "}
          <a className={legalLink} href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            tools.google.com/dlpage/gaoptout
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Other companies’ cookies",
    body: (
      <p>
        When you open a link to another website, or use a map, video or social button on a page that has one, that company may set its own cookies, such as Google, Facebook or WhatsApp. We do not control
        them. Please read their policies. We keep these to a minimum.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we add a new tool that uses cookies, we will update this page before we use it and ask you first if it is not essential. The date at the top shows when this page was last changed. For more about how we
        look after your personal information, see our{" "}
        <Link className={legalLink} href="/privacy-policy">
          privacy policy
        </Link>
        . You can also email <LegalMail /> with any question about {site.short}’s use of cookies.
      </p>
    ),
  },
];

export default function CookiePolicy() {
  return (
    <LegalPage
      current="/cookie-policy"
      title="Cookie Policy"
      intro={`Last updated ${UPDATED}. This page explains, in plain words, which cookies this website uses and how you stay in control.`}
      sections={sections}
    />
  );
}
