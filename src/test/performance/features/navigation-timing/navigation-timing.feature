@performance @navigation-timing
Feature: Navigation timing budgets
  As a performance engineer
  I want key navigation timings measured on real pages
  So that regressions in server response time or page load are caught early

  @smoke
  Scenario: Main page meets its navigation timing budget
    Given I am on the Wikipedia main page
    Then TTFB should be under 1500 ms
    And DOMContentLoaded should be under 4000 ms
    And full page load should be under 6000 ms

  @regression
  Scenario Outline: Article pages meet their navigation timing budget
    Given I open the Wikipedia article "<title>"
    Then TTFB should be under 1500 ms
    And DOMContentLoaded should be under 4000 ms
    And full page load should be under 6000 ms

    Examples:
      | title            |
      | Software testing |
      | Web browser      |
