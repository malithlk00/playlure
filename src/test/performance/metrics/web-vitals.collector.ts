import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

/**
 * The published `web-vitals` package's `exports` map only allows importing
 * its ESM submodules (./onLCP.js etc.) - it deliberately doesn't expose the
 * prebuilt browser bundles under `dist/*.iife.js` as an importable subpath,
 * so `require.resolve('web-vitals/dist/web-vitals.iife.js')` fails with
 * ERR_PACKAGE_PATH_NOT_EXPORTED even though the file physically exists.
 *
 * Resolving the package's permitted entry point first, then deriving the
 * package root and reading the file directly via fs, sidesteps that
 * restriction - `exports` governs module resolution, not filesystem access.
 * Confirmed working against the installed version before writing this.
 */
function readWebVitalsIifeBundle(): string {
  const entryPoint = require.resolve("web-vitals");
  const packageRoot = path.dirname(path.dirname(entryPoint)); // strip /dist/<file>
  const iifePath = path.join(packageRoot, "dist", "web-vitals.iife.js");
  return readFileSync(iifePath, "utf-8");
}

const webVitalsBundleSource = readWebVitalsIifeBundle();

export type VitalRating = "good" | "needs-improvement" | "poor";

export interface VitalResult {
  value: number;
  rating: VitalRating;
}

export interface WebVitalsSnapshot {
  LCP: VitalResult | null;
  CLS: VitalResult | null;
  INP: VitalResult | null;
}

declare global {
  interface Window {
    __playlureVitals?: WebVitalsSnapshot;
    /** Injected by the web-vitals IIFE bundle - see readWebVitalsIifeBundle(). */
    webVitals: {
      onLCP: (cb: (metric: VitalResult) => void, opts?: { reportAllChanges?: boolean }) => void;
      onCLS: (cb: (metric: VitalResult) => void, opts?: { reportAllChanges?: boolean }) => void;
      onINP: (cb: (metric: VitalResult) => void, opts?: { reportAllChanges?: boolean }) => void;
    };
  }
}

export class WebVitalsCollector {
  constructor(private readonly page: Page) {}

  /**
   * Must be called BEFORE any navigation on this page - addInitScript only
   * affects navigations that happen after it's registered. Installs the
   * official web-vitals library and starts listening immediately, so LCP
   * candidates and layout shifts from the very first frame are captured.
   */
  async install(): Promise<void> {
    await this.page.addInitScript(webVitalsBundleSource);
    await this.page.addInitScript(() => {
      window.__playlureVitals = { LCP: null, CLS: null, INP: null };
      const snapshot = window.__playlureVitals;
      // reportAllChanges: true reports the current provisional value on every
      // update instead of only once when the metric is fully "finalized"
      // (normally on page hide/unload) - necessary to read a value
      // synchronously mid-test rather than forcing a real page-hide event.
      // web-vitals' own `rating` field is used for assertions rather than
      // reimplementing Google's thresholds, so classification stays
      // authoritative even if the official thresholds change later.
      window.webVitals.onLCP(
        (metric) => {
          snapshot.LCP = { value: metric.value, rating: metric.rating };
        },
        { reportAllChanges: true }
      );
      window.webVitals.onCLS(
        (metric) => {
          snapshot.CLS = { value: metric.value, rating: metric.rating };
        },
        { reportAllChanges: true }
      );
      window.webVitals.onINP(
        (metric) => {
          snapshot.INP = { value: metric.value, rating: metric.rating };
        },
        { reportAllChanges: true }
      );
    });
  }

  async read(): Promise<WebVitalsSnapshot> {
    return this.page.evaluate(() => window.__playlureVitals ?? { LCP: null, CLS: null, INP: null });
  }
}
