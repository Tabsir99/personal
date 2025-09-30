"use client";

import { useState } from "react";
import { FaClipboardCheck, FaCopy } from "react-icons/fa6";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  return (
    <span
      className="hover:cursor-pointer inline-block w-16 text-center"
      onClick={() => {
        if (navigator.clipboard) {
          const clipBoard = navigator.clipboard;
          clipBoard.writeText("hello@tabsircg.com");
          setCopied(true);
        } else {
          alert("Clipboard API not supported in current browser version");
        }

        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }}
    >
      {" "}
      {copied ? (
        <FaClipboardCheck className="w-8 h-8 text-green-300" />
      ) : (
        <FaCopy className="w-8 h-8 text-gray-300" />
      )}
    </span>
  );
}
