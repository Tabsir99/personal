import { Editor } from "@tiptap/react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Link as LinkIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LinkModalProps {
  editor: Editor;
  isActive: boolean;
}

const LinkModal = ({ editor, isActive }: LinkModalProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  function onInsertLink(url: string, text: string) {
    if (url) {
      if (text) {
        // If we have both text and URL, set a link with the text
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url, target: "_blank", class: "links" })
          .insertContent(text)
          .run();
      } else {
        // If we only have URL, apply link to the selection
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url, target: "_blank", class: "links" })
          .run();
      }
    }
  }

  const handleInsert = () => {
    onInsertLink(url, text);
    resetAndClose();
  };

  const resetAndClose = () => {
    setUrl("");
    setText("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInsert();
    } else if (e.key === "Escape") {
      resetAndClose();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "p-2 rounded-md cursor-pointer h-8 flex flex-col text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95",
                isActive ?? "bg-zinc-800 text-zinc-100 shadow-inner"
              )}
            >
              <LinkIcon className="w-4 h-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-zinc-950 text-zinc-200 text-xs border-zinc-800"
          >
            Insert Link
          </TooltipContent>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 dark" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Insert Link</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={resetAndClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-text-input">Text</Label>
            <Input
              id="link-text-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url-input">URL</Label>
            <Input
              id="link-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={resetAndClose} size="sm">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleInsert}
              size="sm"
              disabled={!url}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LinkModal;
