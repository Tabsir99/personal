// components/admin/metadata/KeywordsSection.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { memo, useState } from "react";
import { useShallow } from "zustand/shallow";

const KeywordsSection = memo(
  function KeywordsSection() {
    const [newKeyword, setNewKeyword] = useState("");
    const [isAddingKeyword, setIsAddingKeyword] = useState(false);

    const keywords = usePortfolioStore(
      useShallow((state) => state.pageData.keywords)
    );
    const updatePageData = usePortfolioStore.getState().updatePageData;

    const handleAddKeyword = () => {
      if (newKeyword.trim()) {
        updatePageData({
          keywords: [...keywords, newKeyword.trim()],
        });
        setNewKeyword("");
        setIsAddingKeyword(false);
      }
    };

    const handleRemoveKeyword = (index: number) => {
      updatePageData({
        keywords: keywords.filter((_, i) => i !== index),
      });
    };

    return (
      <Card className="bg-zinc-900 text-zinc-100 border-zinc-800">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">Keywords</CardTitle>
          <CardDescription>
            Add relevant keywords to improve search discoverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap min-h-[40px] p-3 border border-white/10 rounded-lg">
            {keywords.map((keyword, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20 px-3 py-1 transition-colors group"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(i)}
                  className="ml-2 hover:text-blue-900 transition-colors"
                  aria-label={`Remove ${keyword}`}
                >
                  <X
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </Badge>
            ))}

            {isAddingKeyword ? (
              <div className="flex gap-2 items-center">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddKeyword();
                    if (e.key === "Escape") setIsAddingKeyword(false);
                  }}
                  className="h-7 w-32 text-sm"
                  placeholder="Type keyword..."
                  autoFocus
                />
                <Button
                  onClick={handleAddKeyword}
                  size="sm"
                  className="h-7 px-2"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingKeyword(false);
                    setNewKeyword("");
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingKeyword(true)}
                className="h-7 border-dashed border-zinc-700 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
              >
                <Plus size={14} className="mr-1" />
                Add Keyword
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
  () => true
);

export default KeywordsSection;
