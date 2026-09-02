@performance @resource-timing
Feature: Resource timing breakdown
  As a performance engineer
  I want per-resource load times grouped by type
  So that I can catch one slow CSS/JS/image/API request, not just a slow page overall

  @smoke
  Scenario: Main page static assets stay within budget
    Given I am on the Wikipedia main page
    Then no stylesheet request should take longer than 3000 ms
    And no script request should take longer than 3000 ms
    And no image request should take longer than 3000 ms

  @regression
  Scenario: Searching stays within its API-request budget
    Given I am on the Wikipedia main page
    When I search for "Cucumber (software)"
    Then no fetch or XHR request should take longer than 3000 ms
