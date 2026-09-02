import { test as uiTest } from "../../ui/fixtures";
import { createBdd } from "playwright-bdd";

import { NavigationTimingCollector } from "../metrics/navigation-timing.collector";
import { WebVitalsCollector } from "../metrics/web-vitals.collector";
import { ResourceTimingCollector } from "../metrics/resource-timing.collector";
import { UserFlowTimer } from "../metrics/user-flow.timer";
import { HarRecordingSession } from "../metrics/har.recorder";

type PerfFixtures = {
  navTiming: NavigationTimingCollector;
  webVitals: WebVitalsCollector;
  resourceTiming: ResourceTimingCollector;
  userFlow: UserFlowTimer;
  // HAR needs its own browser context (recordHar is a context-creation
  // option), so it can't reuse the ambient `page` fixture like the others.
  harPath: string;
  harSession: HarRecordingSession;
};

// Extends the UI suite's own `test` (which already extends playwright-bdd's
// base test) so mainPage/articlePage/makeAxeBuilder are reused here rather
// than duplicated - the POM layer is meant to be shared across suites.
export const test = uiTest.extend<PerfFixtures>({
  navTiming: async ({ page }, use) => {
    await use(new NavigationTimingCollector(page));
  },
  webVitals: async ({ page }, use) => {
    await use(new WebVitalsCollector(page));
  },
  resourceTiming: async ({ page }, use) => {
    await use(new ResourceTimingCollector(page));
  },
  userFlow: async ({ page }, use) => {
    await use(new UserFlowTimer(page));
  },
  // eslint-disable-next-line no-empty-pattern -- standard Playwright fixture idiom for "no dependencies"
  harPath: async ({}, use, testInfo) => {
    await use(testInfo.outputPath("network.har"));
  },
  harSession: async ({ browser, harPath }, use) => {
    const session = new HarRecordingSession(browser, harPath);
    await session.start();
    await use(session);
    await session.stop(); // writes the HAR file to disk
  },
});

export const { Given, When, Then } = createBdd(test);
