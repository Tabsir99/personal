import { Editor } from "@tiptap/react";

const ColorModal = ({
  onClose,
  isOpen,
  setActiveTextColor,
  editor,
}: {
  onClose: () => void;
  isOpen: boolean;
  setActiveTextColor: any;
  editor: Editor;
}) => {
  const colors = {
    blue: [
      "#0D47A1", // Dark Blue
      "#1565C0", // Medium Dark Blue
      "#1976D2", // Medium Blue
      "#1E88E5", // Medium Light Blue
      "#2196F3", // Light Blue
      "#BBDEFB", // Very Light Blue
    ],
    green: [
      "#1B5E20", // Dark Green
      "#2E7D32", // Medium Dark Green
      "#388E3C", // Medium Green
      "#43A047", // Medium Light Green
      "#4CAF50", // Light Green
      "#C8E6C9", // Very Light Green
    ],
    yellow: [
      "#F57F17", // Dark Yellow
      "#F9A825", // Medium Dark Yellow
      "#FBC02D", // Medium Yellow
      "#FDD835", // Medium Light Yellow
      "#FFEB3B", // Light Yellow
      "#FFF9C4", // Very Light Yellow
    ],
    red: [
      "#B71C1C", // Dark Red
      "#C62828", // Medium Dark Red
      "#D32F2F", // Medium Red
      "#E53935", // Medium Light Red
      "#F44336", // Light Red
      "#FFCDD2", // Very Light Red
    ],
    gold: [
      "#A17A26", // Dark Gold
      "#C79100", // Medium Dark Gold
      "#D4A100", // Medium Gold
      "#F0B400", // Medium Light Gold
      "#FFCA28", // Light Gold
      "#FFECB3", // Very Light Gold
    ],
    gray: [
      "#212121", // Dark Gray
      "#424242", // Medium Dark Gray
      "#616161", // Medium Gray
      "#757575", // Medium Light Gray
      "#9E9E9E", // Light Gray
      "#E0E0E0", // Very Light Gray
    ],
  };

  const handleColorClick = (shade: string) => {
    
    editor.commands.toggleTextColor(shade);
    setActiveTextColor(shade);
    onClose();
    return;
  };
  return (
    <>
      {isOpen && (
        <div className="absolute w-fit top-[5%] left-[26%] ">
          <div className="grid grid-cols-6 gap-x-2 gap-y-3 border-2 border-gray-700 rotate-90 bg-[rgb(32,44,59)] p-4 rounded shadow-lg w-fit">
            {Object.entries(colors).map(([_, shades]) =>
              shades.map((shade) => (
                <span
                  key={shade}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  style={{ backgroundColor: shade }}
                  onClick={() => handleColorClick(shade)}
                ></span>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ColorModal;
