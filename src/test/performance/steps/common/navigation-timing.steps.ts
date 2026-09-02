import { expect } from "@playwright/test";
import { Then } from "../../fixtures";

Then("TTFB should be under {int} ms", async ({ navTiming }, budgetMs: number) => {
  const { ttfb } = await navTiming.collect();
  expect(ttfb, `TTFB was ${ttfb}ms`).toBeLessThan(budgetMs);
});

Then("DOMContentLoaded should be under {int} ms", async ({ navTiming }, budgetMs: number) => {
  const { domContentLoaded } = await navTiming.collect();
  expect(domContentLoaded, `DOMContentLoaded was ${domContentLoaded}ms`).toBeLessThan(budgetMs);
});

Then("full page load should be under {int} ms", async ({ navTiming }, budgetMs: number) => {
  const { fullLoad } = await navTiming.collect();
  expect(fullLoad, `Full page load was ${fullLoad}ms`).toBeLessThan(budgetMs);
});
