@api @posts @update
Feature: Update a post

  @regression
  Scenario Outline: Updating a post returns the submitted values
    When I update the post with id <postId> to title "<title>" and body "<body>"
    Then the response status should be 200
    And the response should echo the submitted title and body

    Examples:
      | postId | title              | body              |
      | 1      | Updated title one  | Updated body one  |
      | 2      | Updated title two  | Updated body two  |
