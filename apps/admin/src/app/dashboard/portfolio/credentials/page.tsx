"use client";

import { CheckCircle2, Award, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import CredentialDialog from "@/components/portfolio/modals/Credential";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";

export default function Credentials() {
  const credentials = usePortfolioStore(
    useShallow((state) => state.pageData.credentials)
  );

  const credential = usePortfolioStore().credentials;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Credentials</h2>
          <p className="text-muted-foreground">
            Manage certifications and achievements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {credentials.map((credentialItem, index) => (
          <Card
            key={index}
            className="group relative rounded-xl border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
          >
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
                  active: credentialItem.isActive,
                },
                {
                  variant: "delete",
                  onClick: () => credential.delete(index),
                },
              ]}
              entityName="Credential"
            />

            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/20">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                    {credentialItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{credentialItem.issuer}</span>
                  </div>
                </div>
              </div>

              <p className="mb-4 grow text-sm leading-relaxed text-foreground/80">
                {credentialItem.description}
              </p>

              <div className="flex items-center justify-between border-t border-border/60 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{credentialItem.date}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`#cert-${index}`}
                    className="rounded-lg border border-border/60 bg-muted/60 px-3 py-1.5 text-xs text-foreground/80 transition-all duration-300 hover:bg-accent active:scale-95"
                  >
                    View
                  </a>

                  <a
                    href={credentialItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-all duration-300 hover:border-primary/30 hover:bg-primary/20 active:scale-95"
                  >
                    Verify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <CredentialDialog>
          <AddCard
            title="Add Credential"
            description="Add a new certification or achievement"
          />
        </CredentialDialog>
      </div>
    </div>
  );
}
