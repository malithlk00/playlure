import { expect } from "@playwright/test";
import { Given, When, Then } from "../../fixtures";
import { MainPage } from "../../../ui/pages/main-page/main.page";
import { HarAnalyzer } from "../../metrics/har.recorder";

// harSession has its own dedicated browser context (recordHar is a
// context-creation option), so this feature can't reuse the shared
// "I am on the Wikipedia main page" step, which is bound to the ambient
// `page` fixture instead.
Given("I record network activity to a HAR file", async ({ harSession }) => {
  const mainPage = new MainPage(harSession.page);
  await mainPage.goto();
});

When("I stop recording and close the HAR file", async ({ harSession }) => {
  await harSession.stop();
});

Then("the HAR file should contain at least {int} request", async ({ harPath }, minCount: number) => {
  const summary = new HarAnalyzer(harPath).summarize();
  expect(summary.requestCount).toBeGreaterThanOrEqual(minCount);
});

Then(
  "the HAR file's slowest request should be under {int} ms",
  async ({ harPath }, budgetMs: number) => {
    const summary = new HarAnalyzer(harPath).summarize();
    expect(
      summary.slowestRequest?.timeMs ?? 0,
      summary.slowestRequest ? `Slowest: ${summary.slowestRequest.url}` : "no requests recorded"
    ).toBeLessThan(budgetMs);
  }
);
