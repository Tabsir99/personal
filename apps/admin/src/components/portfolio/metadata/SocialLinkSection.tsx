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
      <Card className="bg-zinc-900 text-zinc-100 border-zinc-800">
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
                <div
                  key={i}
                  className="group relative p-4 border border-white/10 rounded-lg bg-white hover:border-white/20 hover:shadow-sm transition-all duration-200"
                >
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
                          className="h-9 px-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isAddingSocial ? (
                <div className="p-4 border-2 border-dashed border-zinc-700 rounded-lg">
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
                      className="h-8 text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSocial}
                      size="sm"
                      className="h-8 text-zinc-400"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Link
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSocial(true)}
                  className="w-full border-dashed border-zinc-700 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
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
