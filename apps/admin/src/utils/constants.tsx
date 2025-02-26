import {
  Bash,
  Golang,
  JavaScript,
  Python,
  Rust,
  TypeScript,
} from "@/components/ui/icons/icon";

interface Languages {
  name: string;
  icon: React.ReactNode;
  value: string;
}
export const languages: Languages[] = [
  {
    name: "JavaScript",
    icon: <JavaScript />,
    value: "javascript",
  },
  {
    name: "TypeScript",
    icon: <TypeScript />,
    value: "typescript",
  },
  {
    name: "Python",
    icon: <Python />,
    value: "python",
  },
  {
    name: "Bash",
    icon: <Bash />,
    value: "bash",
  },
  {
    name: "Rust",
    icon: <Rust />,
    value: "rust",
  },
  {
    name: "Go",
    icon: <Golang />,
    value: "go",
  },
];
