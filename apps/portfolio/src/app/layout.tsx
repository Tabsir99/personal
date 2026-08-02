import "./globals.css";
import React from "react";
import { type Metadata } from "next";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Instrument_Sans,
} from "next/font/google";
import { Footer } from "@/components/portfolio/footer";
import { ScrollIsland } from "@/components/ui/scroll-island";
import { getPageData } from "@/lib/pageData";

const instrumentSansFont = Instrument_Sans({
  weight: ["400", "700"],
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

const FALLBACK_TITLE =
  "Full-Stack Developer (React, Next.js, Node) — Tabsir CG";
const FALLBACK_DESCRIPTION =
  "Full-stack developer in React, Next.js and Node. I build production web apps for agencies and startups, solo and end to end. Two years shipping, including a SaaS in production.";

// Sourced from the CMS, falling back to the constants above when the admin API
// is unreachable. getPageData() is cached and shared with the Footer.
export async function generateMetadata(): Promise<Metadata> {
  const { title, description, keywords } = await getPageData();

  const metaTitle = title || FALLBACK_TITLE;
  const metaDescription = description || FALLBACK_DESCRIPTION;
  // Keep this to a SINGLE og:image: Discord/Slack render multiple og:image
  // tags as a grid, which tiles the card in half and crops it.
  const images = [{ url: "/og.jpg", width: 1200, height: 630, alt: metaTitle }];

  return {
    metadataBase: new URL("https://tabsircg.com"),
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.length ? keywords : undefined,
    icons: "https://media.tabsircg.com/logo.png",
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: "/",
      siteName: "Tabsir CG",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ["/og.jpg"],
    },
    alternates: { canonical: "/" },
    authors: [{ name: "Tabsir CG" }],
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wires next/font's optimized fonts into base.css's --sans/--serif/--mono vars.
  const fontVars = {
    "--sans": `${instrumentSansFont.style.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
    "--serif": `${instrumentSerifFont.style.fontFamily}, "Cormorant Garamond", Georgia, serif`,
    "--mono": `${jetbrainsMonoFont.style.fontFamily}, "SF Mono", Menlo, monospace`,
  } as React.CSSProperties;

  return (
    <html lang="en" style={fontVars} suppressHydrationWarning>
      <head>
        {/* {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
            defer
            fetchPriority="low"
          ></script>
        )} */}

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
        var p = parseInt(localStorage.getItem("intro-played") || "0");
        var recent = p > Date.now() - 6048e5;            // 7 days
        var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (recent || reduced) document.documentElement.dataset.skipIntro = "1";
      } catch(e){} })();`,
          }}
        />
      </head>

      <body>
        <ScrollIsland />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
