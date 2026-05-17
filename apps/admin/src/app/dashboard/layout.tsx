import { type Metadata } from "next";
import { Toaster } from "sonner";

import DashBoardSidebar from "@/components/dashboard/DashboardSidebar";
import { CreateBlogModal } from "@/components/ui/common/CreateBlogModal";
import { AiDraftBlogModal } from "@/components/ui/common/AiDraftBlogModal";
import ConfirmationModal from "@/components/ui/common/ConfirmationModal";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <DashBoardSidebar />
      <main className="h-screen w-screen overflow-y-scroll bg-background py-6 pl-24 pr-8 text-foreground">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        visibleToasts={3}
        swipeDirections={["left", "bottom"]}
        duration={5000}
        toastOptions={{
          classNames: {
            // Surface
            toast:
              "bg-card! text-card-foreground! border! border-foreground/8! shadow-card-rest! rounded-md! font-sans!",
            // Slots
            title: "text-sm! font-semibold! tracking-tight!",
            description: "text-xs! leading-relaxed! text-muted-foreground!",
            actionButton:
              "bg-foreground! text-background! rounded-sm! font-medium!",
            cancelButton:
              "bg-foreground/4! text-muted-foreground! rounded-sm! font-medium!",
            // Semantic tints — quiet, consistent with badges
            success:
              "bg-card! text-foreground! **:data-icon:text-success!",
            error:
              "bg-card! text-foreground! **:data-icon:text-destructive!",
            warning:
              "bg-card! text-foreground! **:data-icon:text-warning!",
            info: "bg-card! text-foreground! **:data-icon:text-primary!",
          },
        }}
      />
      <CreateBlogModal />
      <AiDraftBlogModal />
      <ConfirmationModal />
    </TooltipProvider>
  );
}
