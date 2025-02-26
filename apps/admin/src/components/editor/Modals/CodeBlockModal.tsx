import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { languages } from "@/utils/constants";
import { Editor } from "@tiptap/react";

interface CodeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
}

const CodeBlockModal = ({ isOpen, onClose, editor }: CodeBlockModalProps) => {
  const handleLanguageSelect = (language: { value: string }) => {
    editor
      .chain()
      .focus()
      .toggleCodeBlock({
        language: language.value,
      })
      .run();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/50 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Select Programming Language
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          {languages.map((lang) => (
            <Button
              key={lang.value}
              variant="outline"
              className="flex border-none items-center justify-start gap-3 h-16 p-4 bg-zinc-800/50 hover:bg-zinc-800/80 transition-all"
              onClick={() => handleLanguageSelect(lang)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md overflow-hidden">
                {lang.icon}
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {lang.name}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodeBlockModal;
