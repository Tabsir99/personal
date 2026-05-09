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
import useUIStore from "@/stores/UIStore";
import { useShallow } from "zustand/shallow";
import { callWithToast } from "@/lib/utils";

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
      className={`h-14 border-2 border-border bg-muted/30 transition-colors duration-200 hover:bg-accent ${className}`}
    >
      {children}
    </Button>
  );
};

const BlogShareModal = () => {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.blogShare)
  );
  const closeModal = useUIStore().closeAllModals;

  const [copySuccess, setCopySuccess] = useState(false);

  const url = data?.url;
  const title = data?.title;

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
    if (!url) return;
    const result = await callWithToast(
      () => navigator.clipboard.writeText(url),
      {
        loading: "Copying...",
        success: "Link copied to clipboard!",
        err: "Failed to copy link",
      },
    );
    if (result !== undefined) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePlatformClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-lg shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Share this article
          </DialogTitle>
          <div className="h-0.5 w-12 rounded-full bg-primary" />
        </DialogHeader>

        <div className="space-y-8 pt-2">
          {/* Social Platforms */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Share on social
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <ShareButton
                  key={platform.name}
                  handleClick={() => handlePlatformClick(platform.link)}
                >
                  <platform.icon size={18} style={{ color: platform.color }} />
                  <span className="text-sm font-medium text-foreground">
                    {platform.name}
                  </span>
                </ShareButton>
              ))}
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Copy link
            </h3>
            <div className="flex gap-3">
              <Input value={url} readOnly className="flex-1" />
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                size="lg"
                className={`shrink-0 px-6 transition-colors duration-200 ${
                  copySuccess
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {copySuccess ? (
                  <>
                    <FaCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaLink className="w-4 h-4" />
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
