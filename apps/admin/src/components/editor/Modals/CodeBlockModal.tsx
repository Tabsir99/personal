import { Editor } from "@tiptap/react";
import { FaJava } from "react-icons/fa";
import {
  SiPython,
  SiRust,
  SiGo,
  SiTypescript,
  SiGnometerminal,
} from "react-icons/si";

const languages = [
  {
    name: "Bash",
    icon: <SiGnometerminal color="" />,
    iconName: "SiShell",
    value: "Bash",
    color: "black",
  },
  {
    name: "Python",
    icon: <SiPython color="#3776ab" />,
    iconName: "SiPython",
    value: "python",
    color: "transparent",
  },
  {
    name: "Java",
    icon: <FaJava color="#007396" />,
    iconName: "FaJava",
    value: "java",
    color: "transparent",
  },
  {
    name: "Typescript",
    icon: <SiTypescript color="#007ACC" />,
    iconName: "SiTypescript",
    value: "typescript",
    color: "white",
  },
  {
    name: "Rust",
    icon: <SiRust color="#FF7584" />,
    iconName: "SiRust",
    value: "rust",
    color: "transparent",
  },
  {
    name: "Go",
    icon: <SiGo color="#00ADD8" />,
    iconName: "SiGo",
    value: "go",
    color: "transparent",
  },
];

const CodeBlockModal = ({
  isOpen,
  onClose,
  editor,
}: {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
}) => {
  if (!isOpen) return null;

  const handleLanguageSelect = (language: { value: string }) => {
    editor
      .chain()
      .focus()
      .toggleCodeBlock({
        language: language.value,
        style: `--language: '${language.value}'`,
      } as any)
      .run();

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-200">
            Select Programming Language
          </h3>
          <div className="mt-2 px-7 py-3">
            <div className="grid grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  <span
                    className={`text-2xl mb-2`}
                    style={{ backgroundColor: lang.color }}
                  >
                    {lang.icon}
                  </span>
                  <span className="text-sm text-gray-300">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlockModal;
