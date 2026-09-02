import { Given, When } from "../../fixtures";

// These mirror src/ui/steps' equivalents in behavior. Kept separate rather
// than shared across projects so this suite's step registry stays entirely
// within src/performance/ - see README for the reasoning.

Given("I am on the Wikipedia main page", async ({ mainPage }) => {
  await mainPage.goto();
});

Given("I open the Wikipedia article {string}", async ({ articlePage }, title: string) => {
  await articlePage.goto(title);
});

When("I search for {string}", async ({ mainPage }, term: string) => {
  await mainPage.searchFor(term);
});
