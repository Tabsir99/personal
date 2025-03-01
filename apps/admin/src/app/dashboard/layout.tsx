import { type Metadata } from "next";

import DashBoardSidebar from "@/components/dashboard/DashboardSidebar";

import { BlogMetadataProvider } from "@/context/WriteBlogContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { BlogSettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "Dashboard Home",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <BlogMetadataProvider>
        <BlogSettingsProvider>
          <DashBoardSidebar />
          <main className=" overflow-y-scroll bg-zinc-950 pl-16 w-screen h-screen">
            {children}
          </main>
        </BlogSettingsProvider>
      </BlogMetadataProvider>
    </NotificationProvider>
  );
}
