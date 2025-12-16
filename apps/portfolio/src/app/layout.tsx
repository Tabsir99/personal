import "./globals.css";
import React, { cache } from "react";
import Footer from "../components/ui/Footer";
import Navbar from "@/components/ui/Header";
import { type Metadata } from "next";
import { Lato, Oswald } from "next/font/google";
import { PageData } from "./page.type";
import { env } from "@/config/env";
import { GlobalCursorGlow } from "@/components/ui/GlowCursor";
import { ScrollAnimationObserver } from "@/components/ui/ScrollObserver";

const latoFont = Lato({
  weight: ["400", "900"],
  display: "swap",
  preload: true,
  subsets: ["latin"],
  style: "normal",
  fallback: [
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;",
  ],
});
const osWaldFont = Oswald({
  weight: "400",
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-oswald",
  fallback: [
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;",
  ],
});

export const getPageData = cache(async (): Promise<PageData> => {
  try {
    const response = await fetch(`${env.ADMIN_ORIGIN}/api/page-data`, {
      headers: {
        serverToken: env.SERVER_TOKEN,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return {
      about: [],
      credentials: [],
      services: [],
      stats: {
        yearsExperience: 0,
        projectsCompleted: 0,
        jobSuccessRate: 0,
        responseTime: "",
        happyClients: 0,
      },
      skills: [],
      projects: [],
      testimonials: [],
      title: "",
      description: "",
      keywords: [],
      profilePicture: "",
      contact: {
        email: "",
        social: [],
      },
    };
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();
  return {
    metadataBase: new URL("https://tabsircg.com"),
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    icons: { icon: env.FAVICON_URL },
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.title,
      description: pageData.description,
    },
    alternates: {
      canonical: `/`,
    },
    authors: [{ name: "Tabsir CG" }],
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{
        fontSize: "18px",
        margin: 0,
        padding: 0,
        scrollBehavior: "smooth",
        overflow: "hidden",
      }}
    >
      <body style={{ margin: 0, padding: 0, backgroundColor: "#101010" }}>
        <div
          id="root"
          style={{
            width: "100vw",
            height: "100vh",
            padding: "4.1rem 0 0",
            overflowY: "scroll",
            overflowX: "hidden",
            scrollBehavior: "smooth",
          }}
          className={latoFont.className + " " + osWaldFont.variable}
        >
          <Navbar />
          <main className=" [word-spacing:0.1rem]">{children}</main>
          <Footer />
        </div>
        <GlobalCursorGlow />
        <ScrollAnimationObserver />
        {/* <BlobCursor /> */}
      </body>
    </html>
  );
}
