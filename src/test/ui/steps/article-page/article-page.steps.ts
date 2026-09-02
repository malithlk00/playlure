import { expect } from "@playwright/test";
import { Given, Then } from "../../fixtures";

Given("I open the Wikipedia article {string}", async ({ articlePage }, title: string) => {
  await articlePage.goto(title);
});

Then("the article heading should be {string}", async ({ articlePage }, expected: string) => {
  await expect(articlePage.heading).toHaveText(expected);
});

Then("the article should have a non-empty introduction", async ({ articlePage }) => {
  const text = await articlePage.getIntroText();
  expect(text.length).toBeGreaterThan(0);
});

Then("the article should list at least {int} category", async ({ articlePage }, min: number) => {
  const count = await articlePage.getCategoryCount();
  expect(count).toBeGreaterThanOrEqual(min);
});
