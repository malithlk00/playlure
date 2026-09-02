import type { Locator } from "@playwright/test";
import { BasePage } from "../base/base.page";

/**
 * Wikipedia's main page. Locators lean on MediaWiki's long-stable portlet ids
 * (#p-navigation, #searchInput) rather than visual/CSS structure, since those
 * are the ids MediaWiki's Vector skin has used across skin revisions - more
 * resilient than styling-based selectors on a real, externally-maintained site.
 */
export class MainPage extends BasePage {
  private readonly searchInput: Locator = this.page.locator("#searchInput");
  private readonly navigation: Locator = this.page.locator("#p-navigation");

  async goto(): Promise<void> {
    await this.page.goto("/wiki/Main_Page");
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(term);
    // Let the suggestions dropdown settle so it doesn't intercept Enter.
    await this.page.waitForTimeout(300);
    await this.searchInput.press("Enter");
    await this.page.waitForURL(/\/wiki\//, { timeout: 15_000 });
  }

  navLink(name: string): Locator {
    return this.navigation.getByRole("link", { name, exact: true });
  }
}
