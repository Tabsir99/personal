"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Briefcase,
  MessageSquare,
  User,
  Code,
  Award,
  Save,
  Loader2,
  Package,
} from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import useUIStore from "@/stores/UIStore";

export default function PortfolioDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const savePageData = usePortfolioStore.getState().savePageData;
  const [saving, isDirty] = usePortfolioStore(
    useShallow((state) => [state.saving, state.isDirty])
  );

  const [activeSection, setActiveSection] = useState("metadata");

  const pathname = usePathname();
  useEffect(() => {
    setActiveSection(pathname.split("/").pop() || "metadata");
  }, [pathname]);

  const loading = usePortfolioStore((state) => state.loading);
  const sections = [
    { id: "metadata", label: "Metadata", icon: FileText },
    { id: "services", label: "Services", icon: Package },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "about", label: "About", icon: User },
    { id: "skills", label: "Skills", icon: Code },
    { id: "credentials", label: "Credentials", icon: Award },
  ];

  useEffect(() => {
    usePortfolioStore
      .getState()
      .loadPageData()
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="text-white absolute w-[calc(100%-6rem)] top-0">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="w-60 min-h-screen border-r border-white/10 pr-8 py-6">
            <div className="mb-4 pb-4 px-4 border-b border-white/10">
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            </div>

            <nav className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="w-full h-12 px-4 py-3 bg-white/5 border border-transparent rounded-lg animate-pulse"
                />
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="w-full h-10 bg-white/5 rounded-md animate-pulse" />
            </div>
          </aside>

          {/* Main Content Loading */}
          <main className="flex-1 overflow-y-auto max-h-screen p-10">
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="animate-spin text-blue-400" />
                <p className="text-white/60 text-lg">
                  Loading portfolio data...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white absolute w-[calc(100%-6rem)] top-0">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 min-h-screen border-r border-white/10 pr-8 py-6">
          <div className="mb-4 pb-4 px-4 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          </div>

          <nav className="flex flex-col gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.id}
                  href={`/dashboard/portfolio/${section.id}`}
                  className={`w-full flex items-center gap-3 p-2 border rounded-lg transition-all duration-200 active:scale-95 ${
                    activeSection === section.id
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{section.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            disabled={saving || !isDirty}
            variant="outline"
            className="w-full mt-8 relative active:scale-95"
            onClick={savePageData}
          >
            <Save size={16} className={isDirty ? "text-orange-500" : ""} />
            Save Changes
            {isDirty && (
              <span className="absolute top-1/2 -translate-y-1/2 right-3 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
            )}
          </Button>

          {isDirty && (
            <Button
              variant="outline"
              className="w-full mt-2 relative active:scale-95"
              disabled={saving}
              onClick={() => {
                useUIStore.getState().showConfirmation({
                  headerText: "Reset Portfolio",
                  message: "Are you sure you want to reset the portfolio?",
                  onConfirm: () => usePortfolioStore.getState().resetChanges(),
                  confirmButtonText: "Reset",
                  confirmButtonVariant: "destructive",
                  cancelButtonText: "Cancel",
                  cancelButtonVariant: "outline",
                });
              }}
            >
              Reset Changes
            </Button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto max-h-screen p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
