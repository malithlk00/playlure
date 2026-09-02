@api @posts
Feature: Retrieve posts

  @smoke
  Scenario: Getting a known post returns its exact recorded content
    When I request the post with id 1
    Then the response status should be 200
    And the post title should be "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"

  @regression
  Scenario Outline: Getting a post by id returns a matching post
    When I request the post with id <postId>
    Then the response status should be 200
    And the post response id should be <postId>
    And the post response should belong to user <userId>

    Examples:
      | postId | userId |
      | 1      | 1      |
      | 2      | 1      |
      | 11     | 2      |

  @negative
  Scenario: Requesting a non-existent post returns 404
    When I request the post with id 9999
    Then the response status should be 404
