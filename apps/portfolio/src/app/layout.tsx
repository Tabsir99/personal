import "./globals.css";
import "@/components/portfolio/styles.css";
import React from "react";
import { type Metadata } from "next";
import { Lato, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/portfolio/header";
import { Footer } from "@/components/portfolio/footer";

const latoFont = Lato({
  weight: ["300", "400", "700"],
  display: "swap",
  preload: true,
  subsets: ["latin"],
});

const instrumentSerifFont = Instrument_Serif({
  weight: "400",
  display: "swap",
  preload: true,
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMonoFont = JetBrains_Mono({
  weight: ["400", "500"],
  display: "swap",
  preload: true,
  subsets: ["latin"],
});

// TODO: re-wire CMS via getPageData() once the redesigned portfolio
// is mapped onto the admin schema.
export const metadata: Metadata = {
  metadataBase: new URL("https://tabsircg.com"),
  title: "Tabsir CG — Full-stack developer",
  description: "Full-stack web work for teams who'd rather move than rewrite.",
  openGraph: {
    title: "Tabsir CG — Full-stack developer",
    description:
      "Full-stack web work for teams who'd rather move than rewrite.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabsir CG — Full-stack developer",
    description:
      "Full-stack web work for teams who'd rather move than rewrite.",
  },
  alternates: { canonical: "/" },
  authors: [{ name: "Tabsir CG" }],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the temp CSS's --sans/--serif/--mono vars with next/font's
  // optimized fonts so base.css's `font-family: var(--sans)` etc. resolve.
  const fontVars = {
    "--sans": `${latoFont.style.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
    "--serif": `${instrumentSerifFont.style.fontFamily}, "Cormorant Garamond", Georgia, serif`,
    "--mono": `${jetbrainsMonoFont.style.fontFamily}, "SF Mono", Menlo, monospace`,
  } as React.CSSProperties;

  return (
    <html lang="en" style={fontVars}>
      <body>
        <Header />
        <main>
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
