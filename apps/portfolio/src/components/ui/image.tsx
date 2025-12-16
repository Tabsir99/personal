import { env } from "@/config/env";
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function Img({ src, alt = "", ...props }: ImageProps) {
  const isFullUrl =
    /^(https?:\/\/|\/\/|blob:)/.test(src) || src.startsWith("/");

  const imageSrc = isFullUrl ? src : `${env.MEDIA_ORIGIN}/${src}`;

  return <img {...props} src={imageSrc} alt={alt} />;
}
