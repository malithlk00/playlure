import { Given, When, Then } from "../../fixtures";
import { expectNotPoor } from "../../metrics/thresholds";

Given("I install the Core Web Vitals collector", async ({ webVitals }) => {
  // Must run before any navigation - see WebVitalsCollector.install() docs.
  await webVitals.install();
});

When("I wait for Core Web Vitals to settle", async ({ page }) => {
  await page.waitForLoadState("networkidle");
  // LCP candidates and layout shifts can still arrive briefly after
  // networkidle; a short grace period reduces reading a value too early.
  await page.waitForTimeout(1500);
});

Then("LCP should not be rated poor", async ({ webVitals }) => {
  const snapshot = await webVitals.read();
  expectNotPoor("LCP", snapshot.LCP);
});

Then("CLS should not be rated poor", async ({ webVitals }) => {
  const snapshot = await webVitals.read();
  expectNotPoor("CLS", snapshot.CLS);
});

Then("INP should not be rated poor", async ({ webVitals }) => {
  const snapshot = await webVitals.read();
  expectNotPoor("INP", snapshot.INP);
});
