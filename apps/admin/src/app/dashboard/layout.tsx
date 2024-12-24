import { type Metadata } from "next";

import DashBoardSidebar from "@/Components/dashboard/DashboardSidebar";

import { BlogMetadataProvider } from "@/context/WriteBlogContext";
import { NotificationProvider } from "@/context/NotificationContext";

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
        <div className="grid grid-cols-6 h-screen w-screen bg-black overflow-hidden  ">
          <div className="col-[1/1]">
            <DashBoardSidebar />
          </div>

          <main className=" overflow-y-scroll col-[2/-1] bg-transparent pb-0 ">
            {children}
          </main>
        </div>
      </BlogMetadataProvider>
    </NotificationProvider>
  );
}
