"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import {
  Award,
  Briefcase,
  Code,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Save,
  User,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Kbd } from "@/components/ui/Kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import useUIStore from "@/stores/UIStore";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: Section[] = [
  { id: "metadata", label: "Metadata", icon: FileText },
  { id: "services", label: "Services", icon: Package },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code },
  { id: "credentials", label: "Credentials", icon: Award },
];

export default function PortfolioDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("metadata");
  const pathname = usePathname();
  const [saving, isDirty, loading] = usePortfolioStore(
    useShallow((s) => [s.saving, s.isDirty, s.loading]),
  );

  useEffect(() => {
    setActiveSection(pathname.split("/").pop() || "metadata");
  }, [pathname]);

  useEffect(() => {
    usePortfolioStore
      .getState()
      .loadPageData()
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        usePortfolioStore.getState().savePageData();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty]);

  const openReset = () =>
    useUIStore.getState().openModal("confirmation", {
      data: {
        headerText: "Reset Portfolio",
        message: "Discard every unsaved edit across portfolio sections?",
        onConfirm: () => usePortfolioStore.getState().resetChanges(),
        confirmButtonText: "Reset",
        confirmButtonVariant: "destructive",
        cancelButtonText: "Keep editing",
        cancelButtonVariant: "outline",
      },
    });

  return (
    <div className="absolute top-0 w-[calc(100%-6rem)] text-foreground">
      <div className="flex">
        <aside className="flex min-h-screen w-52 shrink-0 flex-col gap-5 border-r border-foreground/[0.06] px-3 py-6">
          <div className="px-2">
            <h1 className="text-lg leading-tight font-semibold tracking-tight">
              Portfolio
            </h1>
          </div>

          <nav>
            {loading ? (
              <div className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <Skeleton key={s.id} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <li key={section.id}>
                      <Link
                        href={`/dashboard/portfolio/${section.id}`}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group/nav-item relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/[0.06] text-foreground"
                            : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/70 group-hover/nav-item:text-foreground",
                          )}
                        />
                        <span className="flex-1 truncate">{section.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="mt-auto flex flex-col gap-1.5 px-2">
            <Button
              type="button"
              size="sm"
              disabled={saving || !isDirty}
              onClick={() => usePortfolioStore.getState().savePageData()}
              className="w-full justify-between"
            >
              <span className="inline-flex items-center gap-1.5">
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving" : "Save changes"}
              </span>
              <Kbd
                size="sm"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
              >
                ⌘S
              </Kbd>
            </Button>
            {isDirty && !saving && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={openReset}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                Discard
              </Button>
            )}
          </div>
        </aside>

        <main className="max-h-screen flex-1 overflow-y-auto p-10">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                <Eyebrow tone="muted" family="mono">
                  Loading portfolio
                </Eyebrow>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
