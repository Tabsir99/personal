import React, { useState } from "react";
import { NodeViewWrapper, NodeViewProps, FaQSectionAttrs } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FAQSectionView: React.FC<NodeViewProps> = ({ node, editor }) => {
  const [items, setItems] = useState<FaQSectionAttrs[]>(node.attrs.items || []);
  const [title, setTitle] = useState(node.attrs.title);
  const [currentItem, setCurrentItem] = useState<FaQSectionAttrs | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTitlePopover, setShowTitlePopover] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  // Update local state when node attributes change
  React.useEffect(() => {
    setItems(node.attrs.items || []);
  }, [node.attrs.items]);

  // Function to add a new FAQ item
  const addItem = () => {
    setCurrentItem({
      id: "",
      question: "",
      answer: "",
    });
    setIsNewItem(true);
    setIsDialogOpen(true);
  };

  // Function to edit an existing FAQ item
  const editItem = (item: FaQSectionAttrs) => {
    setCurrentItem({ ...item });
    setIsNewItem(false);
    setIsDialogOpen(true);
  };

  // Function to remove an FAQ item
  const removeItem = (id: string) => {
    editor.commands.removeFAQItem(id);
  };

  // Function to save changes to an FAQ item
  const saveItem = () => {
    if (!currentItem) return;

    if (isNewItem) {
      const { question, answer } = currentItem;
      editor.commands.addFAQItem({ question, answer });
    } else {
      editor.commands.updateFAQItem(currentItem);
    }

    setIsDialogOpen(false);
  };

  return (
    <NodeViewWrapper as="section">
      <div className="relative group">
        <h2>
          {showTitlePopover ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          ) : (
            title
          )}
        </h2>

        <div className="absolute top-0 right-0 group-hover:opacity-100 opacity-0 transition duration-300 h-full">
          {showTitlePopover ? (
            <>
              <Button
                onClick={() => setShowTitlePopover(false)}
                className="hover:bg-zinc-800 h-full"
              >
                <Check />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowTitlePopover(true)}
                className="hover:bg-zinc-800"
              >
                <Pencil />
              </Button>
              <Button onClick={addItem} className="hover:bg-zinc-800">
                <Plus /> Add Item
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-0">
        {items.map((item) => (
          <details
            key={item.id}
            className="group w-full border-zinc-800 border-b transition-all duration-200 shadow-lg"
          >
            <summary className="list-none group relative cursor-pointer hover:bg-zinc-900/80 flex justify-between items-center px-4 py-3">
              <div
                className={`flex items-center h-full gap-0 absolute top-0 right-0 transition duration-300 opacity-0 group-hover:opacity-100`}
              >
                <Button
                  onClick={() => editItem(item)}
                  className="hover:bg-zinc-800"
                >
                  <Pencil />
                </Button>
                <Button
                  onClick={() => removeItem(item.id)}
                  className="hover:bg-zinc-800"
                >
                  <Trash2 />
                </Button>
              </div>
              <h4 className=" font-bold text-zinc-100">{item.question}</h4>
              <ChevronDown className="h-5 w-5 text-zinc-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-zinc-300 leading-relaxed pb-4 px-4 text-[18px]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark max-w-lg mx-auto text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isNewItem ? "Add New Question" : "Edit Question"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={currentItem?.question || ""}
                onChange={(e) =>
                  setCurrentItem((prev) =>
                    prev ? { ...prev, question: e.target.value } : null
                  )
                }
                placeholder="Enter your question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={currentItem?.answer || ""}
                onChange={(e) =>
                  setCurrentItem((prev) =>
                    prev ? { ...prev, answer: e.target.value } : null
                  )
                }
                placeholder="Enter your answer"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={saveItem}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
};

export default FAQSectionView;

export const FAQSectionPView = ({
  items,
  title,
}: {
  items: FaQSectionAttrs[];
  title: string;
}) => {
  return (
    <section className="w-full py-8 rounded-md border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
            {title}
          </h2>
          <Separator className="mt-4 bg-zinc-800 max-w-lg mx-auto" />
        </div>

        <div className="space-y-0">
          {items.map((item) => (
            <details
              key={item.id}
              className="group w-full border-zinc-800 border-b transition-all duration-200 shadow-lg"
            >
              <summary className="list-none cursor-pointer hover:bg-zinc-900/80 flex justify-between items-center px-4 py-3">
                <h4 className=" font-bold text-zinc-100">{item.question}</h4>
                <ChevronDown className="h-5 w-5 text-zinc-400 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <p className="text-zinc-300 leading-relaxed pb-4 pt-2 px-4 text-[18px]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
