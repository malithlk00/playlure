import { expect } from "@playwright/test";
import { When, Then } from "../../fixtures";

When("I search for {string}", async ({ mainPage }, term: string) => {
  await mainPage.searchFor(term);
});

Then(
  "I should land on the article page titled {string}",
  async ({ articlePage }, expectedTitle: string) => {
    await expect(articlePage.heading).toHaveText(expectedTitle);
  }
);
