import { UAParser } from "ua-parser-js";

export interface ParsedUA {
  browser: string;
  os: string;
  device: string;
}

export function parseUA(ua: string): ParsedUA {
  const parser = new UAParser(ua);

  return {
    browser: parser.getBrowser().name || "Unknown",
    os: parser.getOS().name || "Unknown",
    device: parser.getDevice().type || "desktop",
  };
}
