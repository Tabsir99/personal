import { type Metadata } from "next";
import { Toaster } from "premium-ds/toast";

import DashBoardSidebar from "@/components/Sidebar";
import { CreateBlogModal } from "@/components/ui/common/CreateBlogModal";
import { AiDraftBlogModal } from "@/components/ui/common/AiDraftBlogModal";
import ConfirmationModal from "@/components/ui/common/ConfirmationModal";

export const metadata: Metadata = {
  title: "Analytics Home",
  robots: {
    index: false,
    follow: false,
  },
};

const PremiumToaster = Toaster as any;

export default function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashBoardSidebar />
      <main className="h-screen w-screen overflow-y-scroll bg-background py-6 pl-24 pr-8 text-foreground">
        {children}
      </main>

      <PremiumToaster
        position="bottom-right"
        visibleToasts={3}
        duration={5000}
      />
      <CreateBlogModal />
      <AiDraftBlogModal />
      <ConfirmationModal />
    </>
  );
}
