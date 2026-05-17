"use client";
import { memo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useShallow } from "zustand/shallow";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { cn } from "@/lib/utils";

interface SocialDraft {
  name: string;
  url: string;
  icon: string;
}

const EMPTY_SOCIAL: SocialDraft = { name: "", url: "", icon: "" };

const SocialLinksSection = memo(
  function SocialLinksSection() {
    const [isAddingSocial, setIsAddingSocial] = useState(false);
    const [newSocial, setNewSocial] = useState<SocialDraft>(EMPTY_SOCIAL);

    const contact = usePortfolioStore(
      useShallow((state) => state.pageData.contact),
    );
    const updatePageData = usePortfolioStore.getState().updatePageData;

    const updateEmail = (email: string) =>
      updatePageData({ contact: { ...contact, email } });

    const updateSocial = (index: number, field: keyof SocialDraft, value: string) => {
      const next = [...contact.social];
      next[index] = { ...next[index], [field]: value };
      updatePageData({ contact: { ...contact, social: next } });
    };

    const addSocial = () => {
      if (!newSocial.name.trim() || !newSocial.url.trim()) return;
      updatePageData({
        contact: {
          ...contact,
          social: [
            ...contact.social,
            { ...newSocial, icon: newSocial.icon || "link" },
          ],
        },
      });
      setNewSocial(EMPTY_SOCIAL);
      setIsAddingSocial(false);
    };

    const removeSocial = (index: number) =>
      updatePageData({
        contact: {
          ...contact,
          social: contact.social.filter((_, i) => i !== index),
        },
      });

    return (
      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            How people reach you
          </h2>
        </CardHeader>
        <CardContent className="space-y-6 pt-1 pb-5">
          <div className="flex flex-col gap-2">
            <Eyebrow tone="muted">Email address</Eyebrow>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <Eyebrow tone="muted">Social links</Eyebrow>
              <Eyebrow tone="muted" family="mono">
                · {contact.social.length} link{contact.social.length === 1 ? "" : "s"}
              </Eyebrow>
            </div>

            <div className="space-y-2">
              {contact.social.map((social, i) => (
                <div
                  key={i}
                  className="group/social grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1.5fr_1.5fr_auto]"
                >
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">Platform</Eyebrow>
                    <Input
                      value={social.name}
                      onChange={(e) => updateSocial(i, "name", e.target.value)}
                      className="h-9 text-sm"
                      placeholder="LinkedIn"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">URL</Eyebrow>
                    <Input
                      value={social.url}
                      onChange={(e) => updateSocial(i, "url", e.target.value)}
                      className="h-9 font-mono text-xs"
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">Icon URL</Eyebrow>
                    <Input
                      value={social.icon}
                      onChange={(e) => updateSocial(i, "icon", e.target.value)}
                      className="h-9 font-mono text-xs"
                      placeholder="https://…/icon.png"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeSocial(i)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/[0.08] hover:text-destructive group-hover/social:opacity-100 focus-visible:opacity-100"
                    aria-label={`Remove ${social.name || "social link"}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              <div
                className={cn(
                  "overflow-hidden rounded-md border bg-foreground/[0.02] transition-all duration-300",
                  isAddingSocial
                    ? "max-h-72 border-foreground/[0.06] p-3"
                    : "max-h-0 border-transparent p-0",
                )}
              >
                <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">Platform</Eyebrow>
                    <Input
                      value={newSocial.name}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, name: e.target.value })
                      }
                      className="h-9 text-sm"
                      placeholder="LinkedIn"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">URL</Eyebrow>
                    <Input
                      value={newSocial.url}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, url: e.target.value })
                      }
                      className="h-9 font-mono text-xs"
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Eyebrow tone="muted">Icon URL</Eyebrow>
                    <Input
                      value={newSocial.icon}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, icon: e.target.value })
                      }
                      className="h-9 font-mono text-xs"
                      placeholder="https://…/icon.png"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button
                    onClick={() => {
                      setIsAddingSocial(false);
                      setNewSocial(EMPTY_SOCIAL);
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button onClick={addSocial} size="sm">
                    <Plus className="h-3 w-3" />
                    Add link
                  </Button>
                </div>
              </div>

              {!isAddingSocial && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSocial(true)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add social link
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
  () => true,
);

export default SocialLinksSection;
