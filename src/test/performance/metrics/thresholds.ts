import { expect } from "@playwright/test";
import type { VitalResult } from "./web-vitals.collector";

/**
 * Official Google/web.dev Core Web Vitals thresholds, current as of this
 * writing. Kept here for reference and for the navigation-timing budgets
 * below, which web-vitals doesn't rate itself. For LCP/CLS/INP assertions,
 * prefer the `rating` field the web-vitals library already computes (see
 * expectNotPoor below) over recomputing these numbers by hand - that keeps
 * classification authoritative even if Google revises a threshold.
 *
 * Source: https://web.dev/articles/lcp https://web.dev/articles/cls
 * https://web.dev/articles/inp
 */
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // unitless score
  INP: { good: 200, poor: 500 }, // milliseconds
} as const;

/** Starter navigation-timing budgets for this suite's pages. Illustrative,
 *  not official standards - adjust to your own SLAs. Wikipedia is a live,
 *  real third-party site with variable latency depending on where CI runs,
 *  so these are intentionally generous rather than tight. */
export const NAVIGATION_TIMING_BUDGETS_MS = {
  ttfb: 1500,
  domContentLoaded: 4000,
  fullLoad: 6000,
};

/**
 * Asserts a Core Web Vitals result isn't rated "poor" - deliberately not
 * "must be good", to absorb normal variance on a live external site without
 * masking a genuine regression. See README for the full rationale.
 */
export function expectNotPoor(metricName: "LCP" | "CLS" | "INP", result: VitalResult | null): void {
  expect(result, `${metricName} was never reported - was an interaction/paint expected?`).not.toBeNull();
  expect(
    result!.rating,
    `${metricName} rated "poor" at value ${result!.value} (web-vitals' own classification)`
  ).not.toBe("poor");
}
