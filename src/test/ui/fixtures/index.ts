import { test as base, createBdd } from "playwright-bdd";
import AxeBuilder from "@axe-core/playwright";

import { MainPage } from "../pages/main-page/main.page";
import { ArticlePage } from "../pages/article-page/article.page";

type UiFixtures = {
  mainPage: MainPage;
  articlePage: ArticlePage;
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<UiFixtures>({
  mainPage: async ({ page }, use) => {
    await use(new MainPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  // Factory rather than a single instance, so a scenario can scan more than
  // one page and still get a fresh builder scoped to the current page state.
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]));
  },
});

export const { Given, When, Then } = createBdd(test);
