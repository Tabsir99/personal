"use client";
import { memo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useShallow } from "zustand/shallow";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";

const KeywordsSection = memo(
  function KeywordsSection() {
    const [newKeyword, setNewKeyword] = useState("");
    const [isAddingKeyword, setIsAddingKeyword] = useState(false);

    const keywords = usePortfolioStore(
      useShallow((state) => state.pageData.keywords),
    );
    const updatePageData = usePortfolioStore.getState().updatePageData;

    const handleAdd = () => {
      const value = newKeyword.trim();
      if (!value) return;
      updatePageData({ keywords: [...keywords, value] });
      setNewKeyword("");
      setIsAddingKeyword(false);
    };

    const handleRemove = (index: number) => {
      updatePageData({
        keywords: keywords.filter((_, i) => i !== index),
      });
    };

    return (
      <Card>
        <CardHeader className="flex flex-col gap-1 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Keywords
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Topic tags search engines use to surface this portfolio.
          </p>
        </CardHeader>
        <CardContent className="pt-1 pb-5">
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-foreground/[0.06] bg-foreground/[0.02] p-2.5">
            {keywords.map((keyword, i) => (
              <Badge key={i} variant="neutral" className="gap-1 pr-1">
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  aria-label={`Remove ${keyword}`}
                  className="ml-0.5 inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {isAddingKeyword ? (
              <span className="flex items-center gap-1.5">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                      setIsAddingKeyword(false);
                      setNewKeyword("");
                    }
                  }}
                  className="h-7 w-36 text-sm"
                  placeholder="Type keyword…"
                  autoFocus
                />
                <Button onClick={handleAdd} size="xs">
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingKeyword(false);
                    setNewKeyword("");
                  }}
                  size="xs"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setIsAddingKeyword(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                Add keyword
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
  () => true,
);

export default KeywordsSection;
