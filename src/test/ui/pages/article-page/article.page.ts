import type { Locator } from "@playwright/test";
import { BasePage } from "../base/base.page";

/**
 * A generic Wikipedia article page. #firstHeading and #catlinks are stable
 * MediaWiki ids across skins; the TOC id changed between legacy Vector
 * (#toc) and Vector 2022 (#vector-toc), so both are matched.
 */
export class ArticlePage extends BasePage {
  readonly heading: Locator = this.page.locator("#firstHeading");
  private readonly tableOfContents: Locator = this.page.locator("#vector-toc, #toc");
  private readonly introParagraph: Locator = this.page.locator(".mw-parser-output > p").first();
  private readonly categoryItems: Locator = this.page.locator("#catlinks li");

  async goto(title: string): Promise<void> {
    await this.page.goto(`/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  }

  async isTableOfContentsVisible(): Promise<boolean> {
    return this.tableOfContents.isVisible().catch(() => false);
  }

  async getIntroText(): Promise<string> {
    return (await this.introParagraph.textContent())?.trim() ?? "";
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryItems.count();
  }
}
