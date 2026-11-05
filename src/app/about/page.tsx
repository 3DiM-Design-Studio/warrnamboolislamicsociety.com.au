import {
  ChevronRight,
  GraduationCap,
  Heart,
  HandHeart,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CoastPill } from "@/components/coast-pill";
import { ScrollRow } from "@/components/scroll-row";
import { RichHeading } from "@/components/rich-heading";
import { mission, officeBearers } from "@/content/site";

export const metadata = { title: "About Us" };

const intro =
  "We have created Warrnambool Islamic Society with a mission to serve Warrnambool and neighbouring communities by service, education and empowerment, based on Islamic principles of compassion, unity and justice. We are a not-for-profit organisation.";

const icon = "size-[0.75em]";
const introIcons = {
  "warrnambool#2": <CoastPill />,
  service: <HandHeart className={icon} aria-hidden />,
  education: <GraduationCap className={icon} aria-hidden />,
  empowerment: <Sparkles className={icon} aria-hidden />,
  compassion: <Heart className={icon} aria-hidden />,
  unity: <Users className={icon} aria-hidden />,
  justice: <Scale className={icon} aria-hidden />,
};

// "Dr. Rashid Mahmood" -> "RM" (titles are skipped)
const initials = (name: string) =>
  name
    .split(" ")
    .filter((w) => !/^(mr|dr|mrs|ms)\.?$/i.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const pastels = [
  "#dff3cf",
  "#cdeee3",
  "#d3ecef",
  "#f2e7c6",
  "#e4efd2",
  "#d7e7f2",
];
const people = officeBearers.flatMap((o) =>
  o.names.map((name) => ({ name, role: o.role })),
);

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href="/" className="link-fx">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-brand-dark">
            About Us
          </li>
        </ol>
      </nav>

      <div className="mt-8">
        <RichHeading
          text={intro}
          icons={introIcons}
          highlight="Warrnambool Islamic Society"
        />
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2">
        {mission.map((m) => (
          <div key={m.title} className="rounded-2xl bg-card p-6">
            <h2 className="font-bold text-brand-dark">{m.title}</h2>
            <p className="mt-2 text-sm text-muted">{m.body}</p>
          </div>
        ))}
      </div>

      <section className="pt-24">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_20rem]">
          <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Meet the office bearers who lead our society
          </h2>
          <p className="text-sm text-muted">
            Our committee looks after the day-to-day work of the society and
            serves the Warrnambool community.
          </p>
        </div>
        <div className="mt-10">
          <ScrollRow>
            {people.map((p, i) => (
              <div
                key={`${p.role}-${p.name}`}
                className="w-56 shrink-0 snap-start"
              >
                <div
                  className="relative grid aspect-[4/5] place-items-end overflow-hidden rounded-xl"
                  style={{ backgroundColor: pastels[i % pastels.length] }}
                >
                  <span className="absolute inset-0 grid place-items-center text-6xl font-bold text-brand-dark/25">
                    {initials(p.name)}
                  </span>
                </div>
                <p className="mt-4 font-bold">{p.name}</p>
                <p className="text-sm text-muted">{p.role}</p>
              </div>
            ))}
          </ScrollRow>
        </div>
      </section>
    </div>
  );
}
