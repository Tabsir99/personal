import { clientEnv } from "@/config/env.client";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function Img({ src, alt = "", ...props }: ImageProps) {
  const isFullUrl = /^(https?:\/\/|\/\/|blob:)/.test(src);

  const imageSrc = isFullUrl ? src : `${clientEnv.MEDIA_ORIGIN}/${src}`;

  return <img {...props} src={imageSrc} alt={alt} />;
}
