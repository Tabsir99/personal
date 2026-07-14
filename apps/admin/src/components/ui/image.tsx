import { clientEnv } from "@/config/env.client";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function Img({ src, alt = "", ...props }: ImageProps) {
  const isFullUrl = /^(https?:\/\/|\/\/|blob:)/.test(src);

  const imageSrc = isFullUrl ? src : `${clientEnv.MEDIA_ORIGIN}/${src}`;

  return // eslint-disable-next-line @next/next/no-img-element
    <img {...props} src={imageSrc} alt={alt} />;
}
