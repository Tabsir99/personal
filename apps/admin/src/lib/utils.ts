import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStorageCost(obj: Record<any, any> | string) {
  if (typeof obj === "string") {
    const size = new TextEncoder().encode(obj).length;

    return { size };
  }
  const jsonString = JSON.stringify(obj);
  const jsonSize = new TextEncoder().encode(jsonString).length;
  const objectSize = roughObjectSize(obj);

  return {
    jsonSize: jsonSize, // Size in bytes when stored as JSON
    objectSize: objectSize, // Estimated size in memory as an object
  };
}

function roughObjectSize(obj: Record<any, any>) {
  let bytes = 0;

  // @ts-ignore
  function sizeOf(value) {
    if (value === null || value === undefined) return 0;
    switch (typeof value) {
      case "boolean":
        bytes += 4;
        break;
      case "number":
        bytes += 8;
        break;
      case "string":
        bytes += value.length * 2;
        break;
      case "object":
        if (Array.isArray(value)) {
          value.forEach(sizeOf);
        } else {
          for (let key in value) {
            bytes += key.length * 2; // Key size
            sizeOf(value[key]); // Value size
          }
        }
        break;
    }
  }

  sizeOf(obj);
  return bytes;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}