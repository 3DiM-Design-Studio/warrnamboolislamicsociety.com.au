import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Old WordPress addresses, so links on Google and in people's bookmarks still reach the right page.
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/new-prayer-times", destination: "/prayer-times", permanent: true },
      { source: "/member-registration-form", destination: "/membership", permanent: true },
      { source: "/warrnambool-islamic-society-donation", destination: "/donate", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/wis-is-registered-with-acnc", destination: "/acnc", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  experimental: {
    // Dev only. Skip the automatic "must load instantly" check on every page: the admin area is
    // behind a login, so it can never be instant, and the check only fills the dev screen with
    // warnings. Production behaviour is unchanged.
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
