import { expect } from "@playwright/test";
import { When, Then } from "../../fixtures";

When("I time the search flow for {string}", async ({ mainPage, userFlow }, term: string) => {
  await userFlow.mark("search-start");
  await mainPage.searchFor(term);
  await userFlow.mark("search-end");
  await userFlow.measure("search-flow", "search-start", "search-end");
});

Then(
  "the {string} duration should be under {int} ms",
  async ({ userFlow }, measureName: string, budgetMs: number) => {
    const duration = await userFlow.getDurationMs(measureName);
    expect(duration, `"${measureName}" took ${duration}ms`).toBeLessThan(budgetMs);
  }
);
