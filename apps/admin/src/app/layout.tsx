import "./globals.css";
import type { Metadata } from "next";
import { Lato, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const LatoFont = Lato({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-lato",
  display: "swap",
  preload: true,
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.tabsircg.com"),
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "Tabsir's Blog",
  icons: [
    {
      rel: "icon",
      url: "https://erzrwwwkwpaoyxnz.public.blob.vercel-storage.com/favicon",
      fetchPriority: "high",
      sizes: "48x48",
      type: "image/png",
    },
  ],
  authors: { name: "Tabsir CG", url: "https://tabsircg.com" },
  referrer: "no-referrer",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={cn("font-sans", geist.variable)}>
      <body className={"overflow-x-hidden" + LatoFont.className}>
        {children}
      </body>
    </html>
  );
}
