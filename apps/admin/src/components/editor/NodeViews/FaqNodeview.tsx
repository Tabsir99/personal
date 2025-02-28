import React, { useState } from "react";
import { NodeViewWrapper, NodeViewProps, FaQSectionAttrs } from "@tiptap/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { PlusCircle, Pencil, Trash, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FAQSectionView: React.FC<NodeViewProps> = ({ node, editor }) => {
  const [items, setItems] = useState<FaQSectionAttrs[]>(node.attrs.items || []);
  const [currentItem, setCurrentItem] = useState<FaQSectionAttrs | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <NodeViewWrapper as="section">
      <Card className="w-full dark">
        <CardHeader className="border-b  pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Frequently Asked Questions
            </CardTitle>
            <Button
              onClick={addItem}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border rounded-md overflow-hidden shadow-sm"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative">
                  <AccordionTrigger className="px-6 py-4 flex-1 text-left font-medium transition-colors">
                    {item.question}
                  </AccordionTrigger>

                  <div
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2 rounded-md p-1 shadow-sm z-10 transition duration-300 bg-zinc-800 ${hoveredItem === item.id ? "" : "opacity-0 pointer-events-none"}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        editItem(item);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <AccordionContent className="px-6 pb-4 pt-2">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

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

export const FAQSectionPView = ({ items }: { items: FaQSectionAttrs[] }) => {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
            Frequently Asked Questions
          </h2>
          <Separator className="mt-4 bg-zinc-800 max-w-lg mx-auto" />
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <details key={item.id} className="group w-full border-zinc-800 bg-zinc-900/60 backdrop-blur-sm hover:bg-zinc-900/80 transition-all duration-200 shadow-lg">
              <summary className="list-none cursor-pointer flex justify-between items-center px-4 py-3">
                <h4 className=" font-bold text-zinc-100">{item.question}</h4>
                <ChevronDown className="h-5 w-5 text-zinc-400 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <Separator className="mb-4 bg-zinc-800" />
              <p className="text-zinc-300 leading-relaxed pb-4 px-4 text-[18px]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
