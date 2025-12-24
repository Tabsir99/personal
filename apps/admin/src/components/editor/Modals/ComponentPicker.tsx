import React, { memo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Code,
  Table,
  BarChart,
  FileText,
  FileSpreadsheet,
  Calculator,
  Settings,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";
import { toggleNode } from "../CustomExtensions/toggleNode";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

// Mock component data

type ComponentId =
  | "codeBlock"
  | "faqSection"
  | "dataTable"
  | "chart"
  | "markdown"
  | "csvImport"
  | "calculator"
  | "settingsPanel";

interface Component {
  id: ComponentId;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "content" | "data" | "interactive";
}

const mockComponents: Component[] = [
  {
    id: "codeBlock",
    name: "Code Block",
    description: "Insert syntax-highlighted code snippets",
    icon: <Code />,
    category: "content",
  },
  {
    id: "faqSection",
    name: "FAQ Section",
    description: "Insert a collapsible FAQ section",
    icon: <HelpCircle />,
    category: "content",
  },
  {
    id: "dataTable",
    name: "Data Table",
    description: "Insert an interactive data table",
    icon: <Table />,
    category: "data",
  },
  {
    id: "chart",
    name: "Chart",
    description: "Insert various chart types",
    icon: <BarChart />,
    category: "data",
  },
  {
    id: "markdown",
    name: "Markdown",
    description: "Insert formatted markdown content",
    icon: <FileText />,
    category: "content",
  },
  {
    id: "csvImport",
    name: "CSV Import",
    description: "Import and display CSV data",
    icon: <FileSpreadsheet />,
    category: "data",
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Insert an interactive calculator",
    icon: <Calculator />,
    category: "interactive",
  },
  {
    id: "settingsPanel",
    name: "Settings Panel",
    description: "Insert configurable settings component",
    icon: <Settings />,
    category: "interactive",
  },
];

const ComponentPickerModal = ({ editor }: { editor: Editor }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter components based on search and active tab
  const filteredComponents = mockComponents.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeTab === "all" || component.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  const onInsert = (component: Component) => {
    try {
      toggleNode(component.id as any, editor);
    } catch (error) {}
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "p-2 rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-95"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl dark">
        <DialogHeader>
          <DialogTitle>Insert Component</DialogTitle>
          <DialogDescription>
            Choose a component to insert into your document
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="dark"
        >
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 dark">
            <ScrollArea className="h-72">
              <div className="grid grid-cols-2 gap-3 p-1">
                {filteredComponents.map((component) => (
                  <DialogClose key={component.id} asChild>
                    <div
                      className="flex flex-col p-3 border rounded-lg hover:bg-zinc-800/60 cursor-pointer transition-colors"
                      onClick={() => onInsert(component)}
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <span className=" w-5 h-5 text-primary">
                          {" "}
                          {component.icon}{" "}
                        </span>
                        <h4 className="font-medium text-sm">
                          {component.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        {component.description}
                      </p>
                    </div>
                  </DialogClose>
                ))}

                {filteredComponents.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-gray-500">
                    No components found matching your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className=" mt-2">
          <DialogClose asChild>
            <Button variant="outline" className="text-zinc-200">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ComponentPickerModal, () => true);
