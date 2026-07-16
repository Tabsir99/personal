import { type Metadata } from "next";
import { cookies } from "next/headers";
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

export default async function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarExpanded = cookieStore.get("sidebar-expanded")?.value === "true";

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <DashBoardSidebar defaultExpanded={sidebarExpanded} />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>

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
