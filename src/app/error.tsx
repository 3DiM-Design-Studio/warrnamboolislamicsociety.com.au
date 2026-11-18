"use client";

import Link from "next/link";

// Shown when a page crashes. The rest of the site (header, footer) keeps working around it.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto my-12 w-full max-w-xl rounded-3xl bg-brand-dark px-6 py-12 text-center text-white sm:px-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Something went wrong on our side</h1>
      <p className="mx-auto mt-3 max-w-md text-white/75">
        This is not your fault. Please try again. If it keeps happening, tell us on the contact page and we will fix it, InshaAllah.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white">
          Back to home
        </Link>
      </div>
    </section>
  );
}
