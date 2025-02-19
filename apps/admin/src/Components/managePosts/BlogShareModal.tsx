"use client"

import React, { useState } from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaReddit, FaLink } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";

interface BlogShareModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
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
      className={`flex items-center justify-center gap-3 h-12 hover:text-white hover:scale-105 transition-all ${className}`}
    >
      {children}
    </Button>
  );
};

const BlogShareModal = ({ open, onClose, url }: BlogShareModalProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const platforms = [
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "#1DA1F2",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        `${url}?utm_source=twitter`
      )}`,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#4267B2",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `${url}?utm_source=facebook`
      )}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "#0077b5",
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
      )}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      // toast({
      //   title: "Link copied",
      //   description: "The URL has been copied to your clipboard.",
      //   duration: 2000,
      // });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // toast({
      //   title: "Copy failed",
      //   description: "Failed to copy the URL. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  const handlePlatformClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white font-semibold">
            Share this article
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <ShareButton
                key={platform.name}
                handleClick={() => handlePlatformClick(platform.link)}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
              >
                <platform.icon size={20} color={platform.color} />
                <span className="text-sm font-medium">{platform.name}</span>
              </ShareButton>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              value={url}
              readOnly
              className="bg-zinc-900 border-zinc-800 text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="shrink-0 bg-zinc-800 hover:bg-zinc-700/40 text-zinc-100 hover:text-zinc-200"
            >
              <FaLink className="mr-0 h-4 w-4" />
              {copySuccess ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogShareModal;