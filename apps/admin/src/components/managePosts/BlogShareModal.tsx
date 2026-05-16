"use client";
import { useState } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaReddit,
} from "react-icons/fa";
import { Check, Link2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Kbd } from "@/components/ui/Kbd";
import useUIStore from "@/stores/UIStore";
import { useShallow } from "zustand/shallow";
import { callWithToast } from "@/lib/utils";

const BlogShareModal = () => {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.blogShare),
  );
  const closeModal = useUIStore().closeAllModals;

  const [copySuccess, setCopySuccess] = useState(false);

  const url = data?.url;
  const title = data?.title;

  const platforms = [
    {
      name: "Twitter",
      Icon: FaTwitter,
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        `${url}?utm_source=twitter`,
      )}${title ? `&text=${encodeURIComponent(title)}` : ""}`,
    },
    {
      name: "Facebook",
      Icon: FaFacebook,
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `${url}?utm_source=facebook`,
      )}`,
    },
    {
      name: "LinkedIn",
      Icon: FaLinkedin,
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `${url}?utm_source=linkedin`,
      )}`,
    },
    {
      name: "Reddit",
      Icon: FaReddit,
      link: `https://reddit.com/submit?url=${encodeURIComponent(
        `${url}?utm_source=reddit`,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1.5">
          <Eyebrow tone="muted" family="mono">
            Share
          </Eyebrow>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {title || "this article"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-2.5">
            <Eyebrow tone="muted" size="xs">
              Share on social
            </Eyebrow>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(({ name, Icon, link }) => (
                <Button
                  key={name}
                  onClick={() => handlePlatformClick(link)}
                  variant="outline"
                  size="lg"
                  className="h-11 justify-start gap-3 text-sm font-medium"
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <Eyebrow tone="muted" size="xs">
              Copy link
            </Eyebrow>
            <div className="flex items-center gap-2">
              <Input
                value={url}
                readOnly
                className="flex-1 font-mono text-[12px]"
              />
              <Button
                onClick={copyToClipboard}
                variant={copySuccess ? "default" : "outline"}
                size="default"
                className="shrink-0 gap-1.5"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    Copy
                    <Kbd size="sm" className="ml-1">
                      ⌘C
                    </Kbd>
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
