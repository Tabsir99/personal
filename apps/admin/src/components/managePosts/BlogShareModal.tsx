"use client";
import React, { useState } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaReddit,
  FaLink,
  FaCheck,
} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BlogShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const ShareButton = ({
  children,
  handleClick,
  className,
}: {
  children: React.ReactNode;
  handleClick: () => void;
  className?: string;
}) => {
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`flex items-center justify-center gap-3 h-14 border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-colors duration-200 ${className}`}
    >
      {children}
    </Button>
  );
};

const BlogShareModal = ({ open, onClose, url, title }: BlogShareModalProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const platforms = [
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "#1DA1F2",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        `${url}?utm_source=twitter`
      )}${title ? `&text=${encodeURIComponent(title)}` : ""}`,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#1877F2",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `${url}?utm_source=facebook`
      )}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "#0A66C2",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `${url}?utm_source=linkedin`
      )}`,
    },
    {
      name: "Reddit",
      icon: FaReddit,
      color: "#FF4500",
      link: `https://reddit.com/submit?url=${encodeURIComponent(
        `${url}?utm_source=reddit`
      )}${title ? `&title=${encodeURIComponent(title)}` : ""}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const handlePlatformClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-zinc-950 to-zinc-900 text-white border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Share this article
          </DialogTitle>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </DialogHeader>

        <div className="space-y-8 pt-2">
          {/* Social Platforms */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Share on social
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <ShareButton
                  key={platform.name}
                  handleClick={() => handlePlatformClick(platform.link)}
                >
                  <platform.icon size={18} style={{ color: platform.color }} />
                  <span className="text-sm font-medium text-zinc-200">
                    {platform.name}
                  </span>
                </ShareButton>
              ))}
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Copy link
            </h3>
            <div className="flex gap-3">
              <Input
                value={url}
                readOnly
                className="flex-1 bg-zinc-900/70 border-zinc-700 text-sm text-zinc-300 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              />
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                size="lg"
                className={`shrink-0 px-6 transition-colors duration-200 ${
                  copySuccess
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white"
                }`}
              >
                {copySuccess ? (
                  <>
                    <FaCheck className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaLink className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogShareModal;
