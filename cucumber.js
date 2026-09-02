// This file is NOT used to execute tests (playwright-bdd + Playwright's test
// runner does that — see playwright.config.ts). It exists purely so IDE
// plugins (e.g. the "Cucumber (Gherkin) Full Support" VSCode extension) can
// resolve step definitions and give autocomplete / "go to definition" while
// editing .feature files.
module.exports = {
  default: {
    paths: ['**/features/**/*.feature'],
    require: ['**/steps/**/*.ts', 'src/test/**/fixtures/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [],
  },
};
