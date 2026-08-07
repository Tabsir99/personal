import "server-only";
import { readWebsiteConfig } from "@/lib/analyticsWebsites";
import { escapeSQL } from "@/lib/tinybird";

export async function resolveWebsiteId(requested?: string): Promise<string> {
  const { websites } = await readWebsiteConfig();

  if (requested) {
    const match = websites.find(
      (site) => site.id === requested || site.name === requested,
    );
    if (!match) {
      const known = websites.map((site) => `${site.name} (${site.id})`);
      throw new Error(
        `Unknown website "${requested}". Registered: ${known.join(", ") || "none"}`,
      );
    }
    return escapeSQL(match.id);
  }

  if (websites.length === 0) {
    throw new Error("No analytics websites are registered.");
  }
  if (websites.length > 1) {
    const known = websites.map((site) => `${site.name} (${site.id})`);
    throw new Error(
      `Multiple websites registered — pass websiteId. Options: ${known.join(", ")}`,
    );
  }

  return escapeSQL(websites[0]!.id);
}
