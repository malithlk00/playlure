@ui @search
Feature: Wikipedia search
  As a visitor
  I want to search for a topic from the main page
  So that I land directly on the matching article

  @smoke @regression
  Scenario Outline: Searching for a well-known topic opens its article
    Given I am on the Wikipedia main page
    When I search for "<term>"
    Then I should land on the article page titled "<expectedTitle>"

    @dataset-core
    Examples:
      | term                | expectedTitle       |
      | Software testing    | Software testing    |
      | Cucumber (software) | Cucumber (software) |

    @dataset-extended
    Examples:
      | term        | expectedTitle |
      | TypeScript  | TypeScript    |
      | Web browser | Web browser   |
