import { Editor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Link as LinkIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface LinkModalProps {
  editor: Editor;
  isActive: boolean;
}

const LinkModal = ({ editor, isActive }: LinkModalProps) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [hasSelection, setHasSelection] = useState(false);

  function onInsertLink(url: string, text: string) {
    if (url) {
      if (text) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url, target: "_blank", class: "links" })
          .insertContent(text)
          .run();
      } else {
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
    setPosition(null);
    setHasSelection(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInsert();
    } else if (e.key === "Escape") {
      resetAndClose();
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "p-2 rounded-md cursor-pointer h-8 flex flex-col text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95",
              isActive && "bg-zinc-800 text-zinc-100 shadow-inner"
            )}
            onClick={() => {
              const { from, to } = editor.state.selection;
              const { left, bottom } = editor.view.coordsAtPos(from);

              if (from !== to) setHasSelection(true);
              setPosition({ x: left, y: bottom + 10 });
            }}
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

      <Dialog
        open={!!position}
        onOpenChange={(open) => !open && resetAndClose()}
        modal={false}
      >
        <DialogContent
          className="w-80 p-4 gap-0 dark text-foreground border-zinc-800/40"
          style={{
            top: position?.y,
            left: position?.x,
            transform: "none",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Insert Link</span>
            </DialogTitle>
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
            {hasSelection || (
              <Input
                id="link-text-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text"
                className="w-full"
                autoFocus
              />
            )}

            <Input
              id="link-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={resetAndClose} size="sm">
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleInsert}
                size="sm"
                disabled={!url}
              >
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LinkModal;
