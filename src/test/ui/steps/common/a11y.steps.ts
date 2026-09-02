import { expect } from "@playwright/test";
import { Then } from "../../fixtures";
import type { Result } from "axe-core";

function summarize(violations: Result[]): string {
  return violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s)) - ${v.helpUrl}`)
    .join("\n");
}

// Explicit step rather than a tag-triggered hook - keeps the check visible
// in the Gherkin itself rather than "magic" behavior tied to a tag.
Then(
  "the page should have no critical accessibility violations",
  async ({ makeAxeBuilder, $testInfo }) => {
    const results = await makeAxeBuilder().analyze();

    await $testInfo.attach("accessibility-scan-results.json", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, summarize(critical)).toEqual([]);
  }
);
