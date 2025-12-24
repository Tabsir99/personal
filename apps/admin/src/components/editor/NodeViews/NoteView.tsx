import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  InfoIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

// React component for our NodeView
export const WarningNoteView = ({ node }) => {
  const { type, title } = node.attrs;

  const getIcon = () => {
    switch (type) {
      case "info":
        return <InfoIcon className="h-4 w-4" />;
      case "warning":
        return <AlertTriangleIcon className="h-4 w-4" />;
      case "error":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <AlertCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <NodeViewWrapper>
      <Alert variant={type} className="my-4">
        <div className="flex items-center gap-2">
          {getIcon()}
          <AlertTitle>
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </AlertTitle>
        </div>
        <AlertDescription>
          <NodeViewContent as="div" />
        </AlertDescription>
      </Alert>
    </NodeViewWrapper>
  );
};
