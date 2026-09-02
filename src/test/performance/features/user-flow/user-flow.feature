@performance @user-flow
Feature: Custom user flow duration
  As a performance engineer
  I want to time a specific multi-step user journey
  So that I catch regressions in a flow's total duration, not just individual page loads

  @smoke
  Scenario Outline: The search flow completes within its budget
    Given I am on the Wikipedia main page
    When I time the search flow for "<term>"
    Then the "search-flow" duration should be under <budgetMs> ms

    Examples:
      | term             | budgetMs |
      | Software testing | 5000     |
      | TypeScript       | 5000     |
