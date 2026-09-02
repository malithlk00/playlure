import type { Page } from "@playwright/test";

export interface NavigationTimingSnapshot {
  ttfb: number;
  domContentLoaded: number;
  fullLoad: number;
  domInteractive: number;
}

/**
 * Wraps the standard (not Playwright-specific) Navigation Timing Level 2 API:
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
 */
export class NavigationTimingCollector {
  constructor(private readonly page: Page) {}

  async collect(): Promise<NavigationTimingSnapshot> {
    return this.page.evaluate(() => {
      const [nav] = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (!nav) {
        throw new Error(
          "No navigation timing entry found - call this after the page has finished loading."
        );
      }
      return {
        ttfb: nav.responseStart - nav.requestStart,
        domContentLoaded: nav.domContentLoadedEventEnd,
        fullLoad: nav.loadEventEnd,
        domInteractive: nav.domInteractive,
      };
    });
  }
}
