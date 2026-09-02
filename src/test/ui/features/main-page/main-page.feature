@ui @main-page
Feature: Wikipedia main page
  As a visitor
  I want the Wikipedia main page to load with its standard navigation
  So that I can trust the site is available before I explore it

  @smoke
  Scenario: Main page loads with expected title and navigation
    Given I am on the Wikipedia main page
    Then the page title should contain "Wikipedia"
    And the main navigation should include the following links:
      | Main page      |
      | Contents       |
      | Random article |
    And the page should have no critical accessibility violations
