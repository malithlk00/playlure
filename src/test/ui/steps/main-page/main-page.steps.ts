import { expect } from "@playwright/test";
import { Given, Then } from "../../fixtures";
import type { DataTable } from "playwright-bdd";

Given("I am on the Wikipedia main page", async ({ mainPage }) => {
  await mainPage.goto();
});

Then("the page title should contain {string}", async ({ page }, expected: string) => {
  await expect(page).toHaveTitle(new RegExp(expected, "i"));
});

Then(
  "the main navigation should include the following links:",
  async ({ mainPage }, dataTable: DataTable) => {
    const expectedLinks = dataTable.raw().map((row) => row[0]);
    for (const linkName of expectedLinks) {
      await expect(mainPage.navLink(linkName)).toBeVisible();
    }
  }
);
