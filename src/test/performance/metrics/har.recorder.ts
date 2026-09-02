import { readFileSync } from "node:fs";
import type { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * Wraps browser.newContext({ recordHar }) + context.close() - Playwright
 * writes the HAR file to disk on context close, not before, so this class
 * exists mainly to make that lifecycle explicit and reusable across steps.
 * See: https://playwright.dev/docs/api/class-browser#browser-new-context-option-record-har
 */
export class HarRecordingSession {
  private context: BrowserContext | null = null;
  page!: Page;

  constructor(
    private readonly browser: Browser,
    private readonly harPath: string
  ) {}

  async start(): Promise<Page> {
    this.context = await this.browser.newContext({
      recordHar: { path: this.harPath, mode: "full", content: "embed" },
    });
    this.page = await this.context.newPage();
    return this.page;
  }

  /** Flushes and writes the HAR file. Must be called for the file to exist. */
  async stop(): Promise<void> {
    await this.context?.close();
  }
}

export interface HarSummary {
  requestCount: number;
  totalTransferBytes: number;
  slowestRequest: { url: string; timeMs: number } | null;
}

interface HarEntry {
  request: { url: string };
  response: { bodySize?: number; content?: { size?: number } };
  time: number;
}

/** Reads a HAR file (per http://www.softwareishard.com/blog/har-12-spec/) after recording finished. */
export class HarAnalyzer {
  constructor(private readonly harPath: string) {}

  private load(): HarEntry[] {
    const har = JSON.parse(readFileSync(this.harPath, "utf-8"));
    return har.log?.entries ?? [];
  }

  summarize(): HarSummary {
    const entries = this.load();
    const totalTransferBytes = entries.reduce((sum, e) => {
      const size = e.response.bodySize && e.response.bodySize > 0 ? e.response.bodySize : 0;
      return sum + size;
    }, 0);

    let slowestRequest: HarSummary["slowestRequest"] = null;
    for (const entry of entries) {
      if (!slowestRequest || entry.time > slowestRequest.timeMs) {
        slowestRequest = { url: entry.request.url, timeMs: entry.time };
      }
    }

    return { requestCount: entries.length, totalTransferBytes, slowestRequest };
  }
}
