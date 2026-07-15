"use client";
import { memo, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { TextField } from "premium-ds/text-field";
import { Tag, TagGroup } from "premium-ds/tag";
import { Button } from "premium-ds/button";
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
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-1 px-6 pt-5 pb-3">
          <h2 className="text-base leading-tight font-semibold tracking-tight">
            Keywords
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Topic tags search engines use to surface this portfolio.
          </p>
        </div>
        <div className="px-6 pt-1 pb-5">
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-foreground/6 bg-foreground/2 p-2.5">
            <TagGroup label="Keywords list">
              {keywords.map((keyword, i) => (
                <Tag
                  key={keyword}
                  onRemove={() => handleRemove(i)}
                  removeLabel={`Remove ${keyword}`}
                  size="sm"
                >
                  {keyword}
                </Tag>
              ))}
            </TagGroup>

            {isAddingKeyword ? (
              <span className="flex items-center gap-1.5">
                <TextField
                  id="new-keyword-input"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                      setIsAddingKeyword(false);
                      setNewKeyword("");
                    }
                  }}
                  className="w-36 text-sm [&_.fld\_\_input]:h-7"
                  placeholder="Type keyword…"
                  autoFocus
                  size="sm"
                />
                <Button onClick={handleAdd} size="sm" variant="primary">
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingKeyword(false);
                    setNewKeyword("");
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingKeyword(true)}
                className="text-muted-foreground hover:text-foreground"
                iconLeft={<Plus size={12} />}
              >
                Add keyword
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
  () => true,
);

export default KeywordsSection;
