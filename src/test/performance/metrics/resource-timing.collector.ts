import type { Page } from "@playwright/test";

export interface ResourceTimingEntrySnapshot {
  name: string;
  duration: number;
  initiatorType: string; // 'link' (css), 'script', 'img', 'fetch', 'xmlhttprequest', etc.
  transferSize: number;
}

/** initiatorType values that represent an API-style call rather than a static asset. */
const API_INITIATOR_TYPES = ["fetch", "xmlhttprequest", "beacon"];

export class ResourceTimingCollector {
  constructor(private readonly page: Page) {}

  async collectAll(): Promise<ResourceTimingEntrySnapshot[]> {
    return this.page.evaluate(() =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map((r) => ({
        name: r.name,
        duration: r.duration,
        initiatorType: r.initiatorType,
        transferSize: r.transferSize ?? 0,
      }))
    );
  }

  async collectStylesheets(): Promise<ResourceTimingEntrySnapshot[]> {
    const all = await this.collectAll();
    // MediaWiki serves stylesheets via <link>, whose initiatorType is "link" or "css".
    return all.filter((r) => r.initiatorType === "link" || r.initiatorType === "css");
  }

  async collectScripts(): Promise<ResourceTimingEntrySnapshot[]> {
    const all = await this.collectAll();
    return all.filter((r) => r.initiatorType === "script");
  }

  async collectImages(): Promise<ResourceTimingEntrySnapshot[]> {
    const all = await this.collectAll();
    return all.filter((r) => r.initiatorType === "img");
  }

  async collectApiRequests(): Promise<ResourceTimingEntrySnapshot[]> {
    const all = await this.collectAll();
    return all.filter((r) => API_INITIATOR_TYPES.includes(r.initiatorType));
  }
}
