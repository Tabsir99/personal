"use client";

import { useState } from "react";
import { Check, Link, TwitterLogo, FacebookLogo, LinkedinLogo, RedditLogo } from "@phosphor-icons/react";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";
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
      Icon: TwitterLogo,
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        `${url}?utm_source=twitter`,
      )}${title ? `&text=${encodeURIComponent(title)}` : ""}`,
    },
    {
      name: "Facebook",
      Icon: FacebookLogo,
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        `${url}?utm_source=facebook`,
      )}`,
    },
    {
      name: "LinkedIn",
      Icon: LinkedinLogo,
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `${url}?utm_source=linkedin`,
      )}`,
    },
    {
      name: "Reddit",
      Icon: RedditLogo,
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
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      title={title ? `Share "${title}"` : "Share post"}
    >
      <div className="space-y-6 pt-2">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {platforms.map(({ name, Icon, link }) => (
              <Button
                key={name}
                onClick={() => handlePlatformClick(link)}
                variant="secondary"
                size="lg"
                className="h-11 justify-start gap-3 text-sm font-medium"
                iconLeft={<Icon size={16} aria-hidden="true" />}
              >
                <span>{name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              value={url}
              readOnly
              className="w-full h-9 px-3 bg-muted/40 text-xs font-mono rounded-md border border-border outline-none focus:border-primary flex-1"
            />
            <Button
              onClick={copyToClipboard}
              variant={copySuccess ? "primary" : "secondary"}
              className="shrink-0 gap-1.5 min-h-[36px]"
              iconLeft={copySuccess ? <Check size={14} /> : <Link size={14} />}
            >
              {copySuccess ? (
                "Copied"
              ) : (
                <>
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
    </Dialog>
  );
};

export default BlogShareModal;
