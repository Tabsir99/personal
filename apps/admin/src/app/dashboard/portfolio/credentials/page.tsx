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
          <p className="text-white/50">
            Manage certifications and achievements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {credentials.map((credentialItem, index) => (
          <Card
            key={index}
            className="group relative border-white/8 bg-white/2 backdrop-blur-sm hover:bg-white/4 hover:border-white/12 transition-all duration-300 rounded-xl"
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
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:border-blue-500/30">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white/95 mb-1 group-hover:text-blue-400 transition-colors duration-300">
                    {credentialItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>{credentialItem.issuer}</span>
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-4 grow leading-relaxed">
                {credentialItem.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/8">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{credentialItem.date}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`#cert-${index}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/8 hover:border-white/15 transition-all duration-300 active:scale-95"
                  >
                    View
                  </a>

                  <a
                    href={credentialItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-300 flex items-center gap-1 active:scale-95"
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
