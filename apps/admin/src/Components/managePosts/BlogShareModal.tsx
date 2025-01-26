import React, { useEffect, useState } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaReddit,
  FaLink,
  FaTimes,
} from "react-icons/fa";

interface BlogShareModalProps {
  onClose: () => void;
  url: string;
}

const ShareButton = ({
  children,
  handleClick,
}: {
  children: React.ReactNode;
  handleClick: () => void;
}) => {
  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg
    transition-all duration-200 ease-in-out
    bg-opacity-10 hover:bg-opacity-15
    shadow-sm hover:shadow-md
    transform hover:-translate-y-0.5
    border border-transparent hover:border-opacity-20 hover:border-white"
    >
      {children}
    </button>
  );
};
const BlogShareModal = ({ onClose, url }: BlogShareModalProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);
  const platforms = [
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "#1DA1F2",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${url}?utm_source=twitter`)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#4267B2",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${url}?utm_source=facebook`)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "#0077b5",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${url}?utm_source=linkedin`)}`,
    },
    {
      name: "Reddit",
      icon: FaReddit,
      color: "#FF4500",
      link: `https://reddit.com/submit?url=${encodeURIComponent(`${url}?utm_source=reddit`)}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePlatformClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div
        className={`bg-[#121212] rounded-lg w-full max-w-md p-6 relative transition duration-200 ease-linear ${shouldRender ? "" : "scale-75 opacity-0 origin-center"}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-6">
          Share the blog
        </h2>

        {/* Social platforms */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {platforms.map((platform) => (
            <ShareButton
              key={platform.name}
              handleClick={() => handlePlatformClick(platform.link)}
            >
              <platform.icon size={20} color={platform.color} />
              <span>{platform.name}</span>
            </ShareButton>
          ))}
        </div>

        {/* Copy link section */}
        <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center justify-between">
          <div className="truncate flex-1 text-neutral-300 text-sm">{url}</div>
          <button
            onClick={copyToClipboard}
            className="ml-4 flex items-center gap-2 bg-[#242424] hover:bg-[#2a2a2a]
                     text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaLink size={16} />
            {copySuccess ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogShareModal;
