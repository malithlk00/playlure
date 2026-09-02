import type { Page } from "@playwright/test";

/** Thin wrapper around the standard User Timing API (performance.mark/measure). */
export class UserFlowTimer {
  constructor(private readonly page: Page) {}

  async mark(name: string): Promise<void> {
    await this.page.evaluate((markName) => performance.mark(markName), name);
  }

  async measure(measureName: string, startMark: string, endMark: string): Promise<void> {
    await this.page.evaluate(
      ({ measureName, startMark, endMark }) => {
        performance.measure(measureName, startMark, endMark);
      },
      { measureName, startMark, endMark }
    );
  }

  async getDurationMs(measureName: string): Promise<number> {
    return this.page.evaluate((name) => {
      const entry = performance.getEntriesByName(name, "measure").pop();
      if (!entry) {
        throw new Error(`No performance.measure() entry named "${name}" was found.`);
      }
      return entry.duration;
    }, measureName);
  }
}
