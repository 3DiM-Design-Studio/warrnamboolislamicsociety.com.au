import { AnalyticsChoiceButton } from "@/components/analytics-consent";
import { PageShell } from "@/components/page-shell";
import { site } from "@/content/site";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <PageShell title="Privacy Policy">
      <p>
        {site.name} collects only the information you send us through the contact form
        (name, email and message) and standard analytics data via Google Analytics. We use
        it to respond to you and to understand site usage, and we do not sell it.
      </p>
      <p>
        To ask about or remove your information, email{" "}
        <a className="text-brand link-fx" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
      <h2 className="text-xl font-bold">Counting visits (Google Analytics)</h2>
      <p>
        We count visits with Google Analytics only if you say yes on the notice shown when you first visit. It sets small files
        (cookies) in your browser and tells us which pages are used. It is never used for ads. You can change your mind at any time.
      </p>
      <AnalyticsChoiceButton />
      <p className="text-sm text-muted">
        This is a short placeholder. The original policy on the old WordPress site is a
        default template and should be reviewed before launch.
      </p>
    </PageShell>
  );
}
