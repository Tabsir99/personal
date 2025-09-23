import { type Metadata } from "next";

import DashBoardSidebar from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "@/components/ui/sonner";
import { CreateBlogModal } from "@/context/CreateBlogModal";

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
    <>
      <DashBoardSidebar />
      <main className=" overflow-y-scroll bg-zinc-950 pl-16 w-screen h-screen">
        {children}
      </main>

      <Toaster
        richColors
        position="bottom-right"
        visibleToasts={3}
        swipeDirections={["left", "bottom"]}
        duration={5000}
      />
      <CreateBlogModal />
    </>
  );
}
