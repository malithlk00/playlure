import { expect } from "@playwright/test";
import { Then } from "../../fixtures";

function worstDuration(entries: { duration: number }[]): number {
  return entries.reduce((max, e) => Math.max(max, e.duration), 0);
}

Then("no stylesheet request should take longer than {int} ms", async ({ resourceTiming }, budgetMs: number) => {
  const entries = await resourceTiming.collectStylesheets();
  expect(worstDuration(entries)).toBeLessThan(budgetMs);
});

Then("no script request should take longer than {int} ms", async ({ resourceTiming }, budgetMs: number) => {
  const entries = await resourceTiming.collectScripts();
  expect(worstDuration(entries)).toBeLessThan(budgetMs);
});

Then("no image request should take longer than {int} ms", async ({ resourceTiming }, budgetMs: number) => {
  const entries = await resourceTiming.collectImages();
  expect(worstDuration(entries)).toBeLessThan(budgetMs);
});

Then(
  "no fetch or XHR request should take longer than {int} ms",
  async ({ resourceTiming }, budgetMs: number) => {
    const entries = await resourceTiming.collectApiRequests();
    expect(worstDuration(entries)).toBeLessThan(budgetMs);
  }
);
