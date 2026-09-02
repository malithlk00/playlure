# Playlure test framework

Playwright + BDD (Cucumber/Gherkin) + Page Object Model, in TypeScript. Three independently runnable suites:

- **UI** - 3 pages of Wikipedia (`en.wikipedia.org`)
- **API** - 4 requests against JSONPlaceholder (`jsonplaceholder.typicode.com`)
- **Performance** - navigation timings, Core Web Vitals, resource timings, HAR recording, and custom
  user-flow durations, also against Wikipedia

All three produce Playwright HTML, Allure, and Cucumber JSON reports. The Cucumber JSON is what Playlure's
backend ingests via `POST /api/ingest/results`.

## Setup

```bash
cp .env.example .env
npm install
npx playwright install --with-deps chromium   # UI suite only - not needed for API-only runs
```

## Running

```bash
npm test           # everything (bddgen + all three projects)
npm run test:ui    # Wikipedia UI only
npm run test:api   # JSONPlaceholder only
npm run test:performance  # navigation timing, Core Web Vitals, resource timing, HAR, user flows
npm run test:smoke # anything tagged @smoke, across all suites
npx playwright test --grep @negative   # any tag expression works this way
```

`npm test` runs `bddgen` first (compiles `.feature` files + step definitions into Playwright spec files
under `.features-gen/`, gitignored) and then `playwright test`.

## Structure

```
src/
  ui/
    features/
      main-page/main-page.feature
      search/search.feature
      article-page/article-page.feature
    pages/                    <- Page Object Model
      base/base.page.ts
      main-page/main.page.ts
      article-page/article.page.ts
    steps/
      main-page/  search/  article-page/  common/a11y.steps.ts
    fixtures/index.ts         <- page objects + AxeBuilder wired into playwright-bdd
  api/
    features/
      posts/get-post.feature  create-post.feature  update-post.feature
      users/get-user.feature
    clients/                  <- the API's equivalent of POM: one class per resource
      base/base.client.ts
      posts/posts.client.ts
      users/users.client.ts
    steps/
      posts/  users/
    fixtures/index.ts         <- API clients + a shared request/response context
  performance/
    features/
      navigation-timing/  web-vitals/  resource-timing/  network-har/  user-flow/
    metrics/                  <- the measurement classes (this is what does the actual work)
      navigation-timing.collector.ts   web-vitals.collector.ts
      resource-timing.collector.ts     har.recorder.ts   user-flow.timer.ts   thresholds.ts
    steps/
      common/  web-vitals/  resource-timing/  network-har/  user-flow/
    fixtures/index.ts         <- extends ui/fixtures for POM reuse, adds the 5 collectors above
scripts/
  publish-to-playlure.ts      <- HMAC-signs and POSTs cucumber-report.json to Playlure
.github/workflows/e2e.yml     <- separate UI/API jobs, each publishing to its own Playlure pipeline
```

## What's covered

**UI (3 pages):**
| Feature | Page | Notes |
|---|---|---|
| `main-page.feature` | Main Page | Title, sidebar nav links, a11y scan |
| `search.feature` | Main Page → Article | Scenario Outline, **two separately-tagged Examples blocks** (`@dataset-core` / `@dataset-extended`) so you can run a smaller data subset via tag filtering alone |
| `article-page.feature` | Article Page | Heading, non-empty intro, category count, a11y scan |

**API (4 requests):**
| Feature | Request | Notes |
|---|---|---|
| `get-post.feature` | `GET /posts/:id` | One precise scenario (exact known title) + a Scenario Outline + a `@negative` 404 case |
| `get-user.feature` | `GET /users/:id` | Scenario Outline + `@negative` 404 case |
| `create-post.feature` | `POST /posts` | Scenario Outline; asserts the response actually echoes the submitted title/body, not just "truthy" |
| `update-post.feature` | `PUT /posts/:id` | Scenario Outline, same echo assertion |

All API fixture values (user 1 = "Bret", post 1's exact title, POST returning id 101, etc.) were checked
against JSONPlaceholder's live, static dataset rather than assumed from memory.

## Accessibility

`the page should have no critical accessibility violations` is a reusable step (`src/ui/steps/common/a11y.steps.ts`)
using `@axe-core/playwright`, scoped to `wcag2a`/`wcag2aa` tags. It's an explicit Gherkin step rather than a
tag-triggered hook, so it's visible in the feature file, not hidden behind magic. Full results (not just
pass/fail) are attached to the test report via Playwright's `$testInfo.attach()`. Once Playlure grows a
dedicated accessibility endpoint, this is the natural place to also POST there.

## Performance testing

`src/performance/` covers all five categories via dedicated classes in `metrics/`, each wrapping a
standard (not Playwright-specific) Web Performance API - see
[testdino.com/blog/playwright-performance-testing](https://testdino.com/blog/playwright-performance-testing)
for the general approach this follows, cross-checked against official sources for the parts worth getting
exactly right:

| Category | Class | API used |
|---|---|---|
| Navigation timings (TTFB, DCL, load) | `NavigationTimingCollector` | [Navigation Timing Level 2](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming) |
| Core Web Vitals (LCP, CLS, INP) | `WebVitalsCollector` | Google's own [`web-vitals`](https://github.com/GoogleChrome/web-vitals) library |
| Resource timings (CSS/JS/image/API) | `ResourceTimingCollector` | [Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntriesByType), grouped by `initiatorType` |
| Network activity | `HarRecordingSession` + `HarAnalyzer` | Playwright's [`recordHar`](https://playwright.dev/docs/api/class-browser#browser-new-context-option-record-har) context option |
| Custom user-flow durations | `UserFlowTimer` | [User Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark) (`performance.mark`/`measure`) |

**Why the official `web-vitals` library instead of hand-rolled `PerformanceObserver` code.** The blog's own
example computes CLS as a naive running sum and LCP as the latest entry's `startTime` - a reasonable
simplification for a quick example, but it doesn't match Google's actual algorithm (CLS uses 5-second
session windows and takes the largest one; LCP finalizes on the *last* candidate before the page hides,
not just whichever fired most recently). Reimplementing that by hand, especially for INP, is exactly the
kind of thing worth not guessing at. `WebVitalsCollector` instead injects the real library's prebuilt
browser bundle and reads its own `rating` field (`'good' | 'needs-improvement' | 'poor'`) for assertions,
so classification stays authoritative even if Google revises a threshold.

**One real, non-obvious bug this surfaced**: `web-vitals`'s `package.json` `exports` map only allows
importing its ESM submodules (`./onLCP.js`, etc.) - it does not expose `dist/web-vitals.iife.js` as an
importable subpath, even though the file exists on disk. `require.resolve('web-vitals/dist/web-vitals.iife.js')`
fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. The fix (`readWebVitalsIifeBundle()` in
`web-vitals.collector.ts`) resolves the package's *permitted* entry point first, derives the package root
from that, and reads the IIFE file directly via `fs` - `exports` governs module resolution, not raw
filesystem access. This was verified against the installed package before being relied on, not assumed.

**Design choices worth knowing about:**
- `reportAllChanges: true` is passed to `onLCP`/`onCLS`/`onINP` so a provisional value can be read
  synchronously mid-test. Normally these metrics only "finalize" on page hide/unload; without this flag,
  `webVitals.read()` would return `null` for a page that's still open.
- Web Vitals assertions check "not rated poor" rather than "must be good" - deliberate slack for a live,
  real third-party site with variable latency depending on where CI runs, per `thresholds.ts`.
- INP has no value at all until a real interaction happens - the INP scenario in `web-vitals.feature`
  performs a search first for exactly that reason. Lab-measured INP only reflects the interactions the
  test script actually performs, same caveat the reference article's FAQ makes.
- The `performance` Playwright project is Chromium-only. The PerformanceObserver entry types LCP/CLS/INP
  depend on (`largest-contentful-paint`, `layout-shift`, the event-timing API) are still primarily
  Chromium-specific, matching the reference article's own guidance.
- The HAR feature uses its own `harSession` fixture (a dedicated browser context) rather than the shared
  `page`, since `recordHar` is a context-*creation* option - it can't be bolted onto an already-running
  page. That's why its Given step is worded differently from the other features' navigation steps.
- Performance suite reuses the UI suite's Page Object classes (`MainPage`, `ArticlePage`) by extending its
  fixtures - confirmed working in `bddgen`'s generated output, not just assumed - but deliberately does
  *not* reuse its step definitions, keeping `performance/`'s own step registry self-contained at the cost
  of ~3 short duplicated Given/When steps. See `src/performance/steps/common/navigation.steps.ts`.

## Reporting

Three formats, configured in `playwright.config.ts`, all under `reports/` (gitignored):

- `reports/playwright-report/` - standard interactive HTML report (`npx playwright show-report reports/playwright-report`)
- `reports/allure-results/` → `npm run report:allure` generates and opens the Allure HTML report
- `reports/cucumber-report/report.json` - the file `scripts/publish-to-playlure.ts` sends to Playlure

## Publishing to Playlure

```bash
PLAYLURE_URL=http://localhost:4000 \
PLAYLURE_PIPELINE_ID=<id-from-playlure-settings> \
INGEST_SHARED_SECRET=<same-secret-as-the-backend's-.env> \
npm run publish:playlure
```

This HMAC-signs the body the same way `verifyIngestSignature` on the backend expects, then POSTs it. The
CI workflow does this automatically as a separate step after each test job, so results show up in Playlure
without a manual step in normal use.

## Two Playlure pipelines, not one

The workflow runs UI and API as **separate jobs**, each publishing under its own `PLAYLURE_PIPELINE_ID`
(`PLAYLURE_UI_PIPELINE_ID` / `PLAYLURE_API_PIPELINE_ID` secrets). Register two pipelines in Playlure's
Settings page - e.g. "Wikipedia UI" and "JSONPlaceholder API" - rather than one, since they're logically
independent suites that happen to live in the same repo.

## Honest account of what was and wasn't verified

This was built and tested in a sandboxed environment with **no browser binaries and no network access to
either target site**. What was actually run and confirmed working, not just written:

- `npx bddgen` - compiles every `.feature` file against its step definitions. This is the single strongest
  correctness check available without a browser: **it fails loudly if any Gherkin step doesn't match a step
  definition.** It succeeded, including regenerating cleanly after two real bugs it caught (see below).
- `npx tsc --noEmit` - clean, zero errors, across the whole project including generated spec files.
- `npx eslint .` - clean, zero errors/warnings (one legitimate fix along the way: `no-empty-pattern` on
  Playwright's own `async ({}, use) => {}` fixture idiom, resolved with a targeted disable comment, not a
  workaround).
- `npx playwright test --list` - enumerates all **29 generated tests** across all three projects correctly,
  confirming the full config (three `defineBddConfig` calls, three projects, all three reporters) loads
  without error.
- **Tag filtering, verified against the actual generated output**, not assumed: `--grep @smoke` returns
  exactly the 9 tests tagged smoke across the UI/API suites; `--grep @negative` returns exactly the 2
  negative-path scenarios; `--grep @dataset-core` returns exactly the 2 rows from Search's first Examples
  block; `--grep @performance` and `--project=performance` both independently return exactly the same 10
  tests. Tags from the Feature, the Scenario Outline, and the Examples block all correctly merge into one
  array per generated test.
- The `performance` suite's cross-project fixture reuse (`performance/fixtures` extending `ui/fixtures` for
  `mainPage`/`articlePage`) was confirmed correct by inspecting `bddgen`'s generated output directly, not
  assumed from how the API is documented to work.

**Bugs this caught, not hypothetical ones:**
1. `playwright-bdd@latest` + `@playwright/test@latest` are currently mutually incompatible - the newest
   Playwright reorganized internal files playwright-bdd reaches into directly. Fixed by pinning to the
   versions that actually shipped together: `playwright-bdd@8.5.1` + `@playwright/test@1.60.0`.
2. `@axe-core/playwright`'s loose `playwright-core: ">=1.0.0"` peer dependency let npm resolve a *second*,
   newer copy of `playwright-core` alongside the one nested under `@playwright/test`, and their `Page` types
   didn't structurally match (newer one has `localStorage`/`sessionStorage`, older doesn't) - a real
   `tsc` error, not a false positive. Fixed with a package.json `overrides` entry forcing one resolved
   version everywhere.
3. `allure-playwright`'s actual config key is `resultsDir`, not `outputFolder` - the wrong key was silently
   ignored rather than erroring, so results were written to a stray `./allure-results` at the project root
   instead of `reports/allure-results`. Caught by checking the reporter's compiled source directly after
   noticing the stray directory, not by assuming the config was right because it didn't throw.
4. The project's `tsconfig.json` only had `"lib": ["ES2022"]` - no `"DOM"` - so every `page.evaluate()`
   callback in the new performance collectors that references `window`, `PerformanceNavigationTiming`, etc.
   failed to typecheck. A real gap (these callbacks execute in the browser, but `tsc` still needs DOM types
   to check the callback body's syntax), fixed by adding `"DOM"` to `lib`.
5. `web-vitals`'s `package.json` `exports` map blocks `require.resolve('web-vitals/dist/web-vitals.iife.js')`
   even though the file exists on disk - it only exposes the library's ESM submodules, not its prebuilt
   browser bundles. Fixed by resolving the package's permitted entry point first and reading the IIFE file
   directly via `fs` from the derived package root - verified this workaround actually works before relying
   on it, not just reasoned about.

**What could not be verified here** and is worth doing before trusting this in CI:
- An actual browser run of the UI suite. `npx playwright install` needs `cdn.playwright.dev`/similar CDNs,
  unreachable from this sandbox - the same class of restriction that's blocked Prisma and Playwright browser
  installs elsewhere in this project. The Wikipedia selectors (`#p-navigation`, `#searchInput`,
  `#firstHeading`, `#catlinks`, `#vector-toc`/`#toc`) are MediaWiki's long-stable portlet ids, chosen for
  resilience, but "should be stable" isn't the same as "confirmed working against the live DOM."
- An actual network call to JSONPlaceholder. `jsonplaceholder.typicode.com` isn't in this sandbox's egress
  allowlist either, so the API assertions - while checked against real, freshly-fetched response data during
  development - were never executed as running tests here.
- Whether `$testInfo` is actually available inside the accessibility step at runtime. `bddgen`'s generated
  code only threads `{ makeAxeBuilder }` explicitly into that step's call site, not `{ makeAxeBuilder,
  $testInfo }` - based on how playwright-bdd's `Given`/`When`/`Then` are documented to work (bound fixtures
  with closure over the full fixture set), this is almost certainly fine and just an artifact of how the
  generated file's debug metadata is written, but I can't execute it to be certain. If the accessibility
  step throws on `$testInfo` being undefined on your first real run, that's the one place to look.
- Whether the Core Web Vitals actually come back non-`null` and non-`poor` against live Wikipedia, whether
  `recordHar` actually produces a valid `.har` file structure `HarAnalyzer` can parse, and whether Wikipedia
  reliably produces a fetch/XHR request on search (the resource-timing suite's API-request scenario assumes
  one does, from MediaWiki's search-suggestions behavior, but this wasn't watched happen). All of this
  needs the same real browser run as the UI suite - nothing performance-specific beyond that.

Run `npm test` locally as the first real-world check - that closes every gap above at once.
