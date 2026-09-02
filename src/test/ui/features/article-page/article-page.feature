@ui @article
Feature: Wikipedia article page
  As a reader
  I want an article page to render its standard structure
  So that I can navigate and read it reliably

  @regression
  Scenario Outline: Article page renders its standard structure
    Given I open the Wikipedia article "<title>"
    Then the article heading should be "<title>"
    And the article should have a non-empty introduction
    And the article should list at least 1 category
    And the page should have no critical accessibility violations

    Examples:
      | title             |
      | Software testing  |
      | Web browser       |
