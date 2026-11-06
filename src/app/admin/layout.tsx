import type { Metadata } from "next";

// The admin is private: keep it out of search results.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | WIS Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
