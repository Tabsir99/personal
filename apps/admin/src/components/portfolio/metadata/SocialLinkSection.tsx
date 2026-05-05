// components/admin/metadata/SocialLinksSection.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/shallow";
import { memo, useState } from "react";

const SocialLinksSection = memo(
  function SocialLinksSection() {
    const [isAddingSocial, setIsAddingSocial] = useState(false);
    const [newSocial, setNewSocial] = useState({ name: "", url: "", icon: "" });

    const contact = usePortfolioStore(
      useShallow((state) => state.pageData.contact)
    );
    const updatePageData = usePortfolioStore.getState().updatePageData;

    const handleUpdateEmail = (email: string) => {
      updatePageData({
        contact: { ...contact, email },
      });
    };

    const handleAddSocial = () => {
      if (newSocial.name.trim() && newSocial.url.trim()) {
        updatePageData({
          contact: {
            ...contact,
            social: [
              ...contact.social,
              { ...newSocial, icon: newSocial.icon || "link" },
            ],
          },
        });
        setNewSocial({ name: "", url: "", icon: "" });
        setIsAddingSocial(false);
      }
    };

    const handleRemoveSocial = (index: number) => {
      updatePageData({
        contact: {
          ...contact,
          social: contact.social.filter((_, i) => i !== index),
        },
      });
    };

    const handleUpdateSocial = (
      index: number,
      field: string,
      value: string
    ) => {
      const updatedSocial = [...contact.social];
      updatedSocial[index] = { ...updatedSocial[index], [field]: value };
      updatePageData({
        contact: {
          ...contact,
          social: updatedSocial,
        },
      });
    };

    return (
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">Contact Information</CardTitle>
          <CardDescription>How people can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => handleUpdateEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Social Links</Label>
              <p className="text-xs mt-1">Connect your social media profiles</p>
            </div>

            <div className="space-y-3">
              {contact.social.map((social, i) => (
                <div key={i}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Platform</Label>
                      <Input
                        value={social.name}
                        onChange={(e) =>
                          handleUpdateSocial(i, "name", e.target.value)
                        }
                        className="h-9 text-sm"
                        placeholder="e.g., LinkedIn"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={social.url}
                        onChange={(e) =>
                          handleUpdateSocial(i, "url", e.target.value)
                        }
                        className="h-9 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Icon Url</Label>
                      <div className="flex gap-2">
                        <Input
                          value={social.icon}
                          onChange={(e) =>
                            handleUpdateSocial(i, "icon", e.target.value)
                          }
                          className="h-9 text-sm"
                          placeholder="https://example.com/icon.png"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSocial(i)}
                          className="h-9 px-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className={`${isAddingSocial ? "max-h-120 border-border p-4" : "max-h-0 border-transparent p-0"} mt-8 overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Platform</Label>
                    <Input
                      value={newSocial.name}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, name: e.target.value })
                      }
                      className="h-9 text-sm"
                      placeholder="e.g., LinkedIn"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={newSocial.url}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, url: e.target.value })
                      }
                      className="h-9 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Icon Url</Label>
                    <Input
                      value={newSocial.icon}
                      onChange={(e) =>
                        setNewSocial({ ...newSocial, icon: e.target.value })
                      }
                      className="h-9 text-sm"
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      setIsAddingSocial(false);
                      setNewSocial({ name: "", url: "", icon: "" });
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSocial}
                    size="sm"
                    className="h-8"
                  >
                    <Plus size={14} />
                    Add Link
                  </Button>
                </div>
              </div>
              {isAddingSocial || (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSocial(true)}
                  className="w-full border-dashed border-border hover:bg-accent"
                >
                  <Plus size={16} />
                  Add Social Link
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
  () => true
);

export default SocialLinksSection;
