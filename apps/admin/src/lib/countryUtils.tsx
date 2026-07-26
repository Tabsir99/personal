import React from "react";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function formatCountryName(code: string | undefined | null): string {
  if (!code) return "Unknown";
  if (code.length !== 2) return code;
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export interface CountryFlagProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  code: string | undefined | null;
}

export function CountryFlag({ code, className, ...props }: CountryFlagProps) {
  if (!code || code.length !== 2) return null;

  return (
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
      alt={code}
      className={
        className || "h-3 w-4 rounded-sm object-cover ring-1 ring-foreground/10"
      }
      {...props}
    />
  );
}
