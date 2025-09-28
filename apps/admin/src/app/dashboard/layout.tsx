import { type Metadata } from "next";

import DashBoardSidebar from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "@/components/ui/sonner";
import { CreateBlogModal } from "@/components/ui/common/CreateBlogModal";
import ConfirmationModal from "@/components/ui/common/ConfirmationModal";

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
      <main className=" overflow-y-scroll bg-zinc-950/95 pl-24 pr-8 py-6 w-screen h-screen text-zinc-100">
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
      <ConfirmationModal />
    </>
  );
}
