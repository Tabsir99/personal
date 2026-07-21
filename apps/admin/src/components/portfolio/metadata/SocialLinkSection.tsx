"use client";
import { memo, useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
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

    const updateContact = (patch: Partial<typeof contact>) =>
      updatePageData({ contact: { ...contact, ...patch } });

    const updateSocial = (
      index: number,
      field: keyof SocialDraft,
      value: string,
    ) => {
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
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 px-6 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            How people reach you
          </h2>
        </div>
        <div className="space-y-6 px-6 pt-1 pb-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              id="email"
              type="email"
              label="Email address"
              value={contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
              placeholder="your@email.com"
            />
            <TextField
              id="phone"
              label="Phone"
              value={contact.phone}
              onChange={(e) => updateContact({ phone: e.target.value })}
              placeholder="+880 17 ████ ████"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
            <TextField
              id="cal-label"
              label="Booking label"
              value={contact.calLabel}
              onChange={(e) => updateContact({ calLabel: e.target.value })}
              placeholder="Cal.com / tabsir"
            />
            <TextField
              id="cal-url"
              label="Booking URL"
              value={contact.calUrl}
              onChange={(e) => updateContact({ calUrl: e.target.value })}
              size="sm"
              className="font-mono"
              placeholder="https://cal.com/tabsir"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Social links
              </span>
              <span className="text-xs text-muted-foreground">
                {contact.social.length} link
                {contact.social.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-2">
              {contact.social.map((social, i) => (
                <div
                  key={i}
                  className="group/social grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1.5fr_1.5fr_auto]"
                >
                  <TextField
                    label="Platform"
                    value={social.name}
                    onChange={(e) => updateSocial(i, "name", e.target.value)}
                    size="sm"
                    placeholder="LinkedIn"
                  />
                  <TextField
                    label="URL"
                    value={social.url}
                    onChange={(e) => updateSocial(i, "url", e.target.value)}
                    className="font-mono"
                    placeholder="https://…"
                    size="sm"
                  />
                  <TextField
                    label="Icon URL"
                    value={social.icon}
                    onChange={(e) => updateSocial(i, "icon", e.target.value)}
                    className="font-mono"
                    placeholder="https://…/icon.png"
                    size="sm"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeSocial(i)}
                    className="opacity-0 transition-opacity group-hover/social:opacity-100 focus-visible:opacity-100"
                    aria-label={`Remove ${social.name || "social link"}`}
                    iconLeft={<Trash size={14} />}
                  />
                </div>
              ))}

              <div
                className={cn(
                  "overflow-hidden rounded-md border bg-foreground/2 transition-all duration-300",
                  isAddingSocial
                    ? "max-h-72 border-foreground/6 p-3"
                    : "max-h-0 border-transparent p-0",
                )}
              >
                <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <TextField
                    label="Platform"
                    value={newSocial.name}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, name: e.target.value })
                    }
                    size="sm"
                    placeholder="LinkedIn"
                    htmlProps={{ autoFocus: true }}
                  />
                  <TextField
                    label="URL"
                    value={newSocial.url}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, url: e.target.value })
                    }
                    className="font-mono"
                    placeholder="https://…"
                    size="sm"
                  />
                  <TextField
                    label="Icon URL"
                    value={newSocial.icon}
                    onChange={(e) =>
                      setNewSocial({ ...newSocial, icon: e.target.value })
                    }
                    className="font-mono"
                    placeholder="https://…/icon.png"
                    size="sm"
                  />
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
                  <Button
                    onClick={addSocial}
                    size="sm"
                    iconLeft={<Plus size={12} />}
                  >
                    Add link
                  </Button>
                </div>
              </div>

              {!isAddingSocial && (
                <Button
                  variant="secondary"
                  onClick={() => setIsAddingSocial(true)}
                  className="w-full text-muted-foreground hover:text-foreground"
                  iconLeft={<Plus size={14} />}
                >
                  Add social link
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  () => true,
);

export default SocialLinksSection;
