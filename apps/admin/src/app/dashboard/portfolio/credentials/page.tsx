"use client";
import { useShallow } from "zustand/shallow";
import { Award, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Img from "@/components/ui/image";
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
          Image-backed records used for sitemap and social preview.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 gap-4 md:grid-cols-2">
        {credentials.map((c, index) => (
          <div
            key={c.title + index}
            style={{ ["--stagger-index" as string]: index }}
          >
            <Card className="group/card relative tactile-lift">
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
                  {c.image ? (
                    <Img
                      src={c.image}
                      alt={c.title}
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="rounded-md border border-primary/15 bg-primary/8 p-2 text-primary">
                      <Award className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="truncate text-base leading-snug font-semibold tracking-tight text-foreground">
                      {c.title}
                    </h3>
                  </div>
                </div>

                {c.link && (
                  <div className="mt-auto flex items-center justify-end border-t border-foreground/6 pt-3 font-mono text-kbd text-muted-foreground">
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
                  </div>
                )}
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
