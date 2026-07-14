"use client";
import { useShallow } from "zustand/shallow";
import { Certificate, ArrowSquareOut } from "@phosphor-icons/react";

import Img from "@/components/ui/image";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import CredentialDialog from "@/components/portfolio/modals/Credential";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";


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
            <div className="group/card relative rounded-lg border border-border bg-card tactile-lift">
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
              <div className="flex h-full flex-col p-6">
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
                      <Certificate size={16} />
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
                      className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <span>Verify</span>
                      <ArrowSquareOut size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
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

