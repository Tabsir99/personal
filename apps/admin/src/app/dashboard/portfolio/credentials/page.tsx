"use client";
import { useShallow } from "zustand/shallow";
import { Award, Calendar, CheckCircle2, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import CredentialDialog from "@/components/portfolio/modals/Credential";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";
import { cn } from "@/lib/utils";

export default function Credentials() {
  const credentials = usePortfolioStore(
    useShallow((state) => state.pageData.credentials),
  );
  const credential = usePortfolioStore().credentials;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Certifications &amp; achievements
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Public-facing record of what you&apos;ve completed.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 gap-4 md:grid-cols-2">
        {credentials.map((c, index) => (
          <div
            key={c.title + index}
            style={{ ["--stagger-index" as string]: index }}
          >
            <Card className="group/credential relative tactile-lift">
              <ActionButtonGroup
                buttons={[
                  {
                    variant: "moveUp",
                    onClick: () => credential.moveUp(index),
                    disabled: index === 0,
                  },
                  {
                    variant: "moveDown",
                    onClick: () => credential.moveDown(index),
                    disabled: index === credentials.length - 1,
                  },
                  {
                    variant: "toggle",
                    onClick: () => credential.toggle(index, "isActive"),
                    active: c.isActive,
                  },
                  {
                    variant: "delete",
                    onClick: () => credential.delete(index),
                  },
                ]}
                entityName="Credential"
              />
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-3 flex items-start gap-3">
                  <div className="rounded-md border border-primary/15 bg-primary/[0.08] p-2 text-primary">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="truncate text-base leading-snug font-semibold tracking-tight text-foreground">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      <span className="truncate">{c.issuer}</span>
                    </div>
                  </div>
                </div>

                <p className="mb-4 grow text-sm leading-relaxed text-foreground/80">
                  {c.description}
                </p>

                <div className="flex items-center justify-between border-t border-foreground/[0.06] pt-3 font-mono text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {c.date}
                  </span>
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "xs" }),
                        "gap-1.5",
                      )}
                    >
                      <span>Verify</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        <CredentialDialog>
          <AddCard
            title="Add credential"
            description="Add a new certification or achievement"
          />
        </CredentialDialog>
      </div>
    </div>
  );
}
