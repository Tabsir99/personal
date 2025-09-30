import "./globals.css";

import Footer from "../components/footer/Footer";
import NavbarContainer from "@/components/UI/Header";
import Observer, { AnimationProvider } from "@/components/theObserver";
import { type Metadata } from "next";
import { Lato, Oswald } from "next/font/google";

const latoFont = Lato({
  weight: "400",
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

export const metadata: Metadata = {
  metadataBase: new URL("https://tabsircg.com"),
  title: "Tabsir's Portfolio",
  description:
    "Custom Web Solutions tailored to your needs. Specialized in NEXTJS and Relational Databases. Ready to bring your Web Development vision to life.",
  icons: {
    icon: "/o-mins.png",
  },
  openGraph: {
    title: "Tabsir's Portfolio",
    description:
      "Custom Web Solutions tailored to your needs. Specialized in NEXTJS and Relational Databases. Ready to bring your Web Development vision to life.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabsir's Portfolio",
    description:
      "Custom Web Solutions tailored to your needs. Specialized in NEXTJS and Relational Databases. Ready to bring your Web Development vision to life.",
  },
  keywords: [
    "Tabsir",
    "Web Development",
    "Next.js",
    "Relational Databases",
    "Full Stack Developer",
    "Custom Web Solutions",
    "Responsive Design",
    "SEO",
    "Website Optimization",
    "Bangladesh Developer",
    "freelance full stack developer",
    "Node.js and Express developer",
    "web application development",
  ],
  authors: [{ name: "Tabsir" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `/`,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
};

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
            backgroundColor: "#101010",
            width: "100vw",
            height: "100vh",
            padding: "4.1rem 0 0",
            overflowY: "scroll",
            overflowX: "hidden",
          }}
          className={latoFont.className + " " + osWaldFont.variable}
        >
          <script src="/script/onload.js" async></script>
          <NavbarContainer />

          <AnimationProvider>
            <main className=" [word-spacing:0.1rem]  ">{children}</main>
            <Observer />
          </AnimationProvider>

          <Footer />
        </div>
      </body>
    </html>
  );
}
