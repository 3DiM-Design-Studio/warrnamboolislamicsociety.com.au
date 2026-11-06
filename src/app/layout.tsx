import { SmoothScroll } from "@/components/smooth-scroll";
import type { Metadata } from "next";
import {
  Libre_Franklin,
  Tajawal,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Devanagari,
  Noto_Sans_Tamil,
} from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { site } from "@/content/site";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

const arabic = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});
const urdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
});
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});
const tamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"] });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.tagline,
};

// The public site's header, footer and banner live in app/(site)/layout.tsx so that /admin does not get them.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${libreFranklin.variable} ${arabic.variable} ${urdu.variable} ${devanagari.variable} ${tamil.variable} h-full antialiased`}
    >
      <body id="top" className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
