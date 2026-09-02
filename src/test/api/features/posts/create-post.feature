@api @posts @create
Feature: Create a post

  @regression
  Scenario Outline: Creating a post echoes the submitted data with a new id
    When I create a post with title "<title>", body "<body>" and userId <userId>
    Then the response status should be 201
    And the created post should have id 101
    And the response should echo the submitted title and body

    Examples:
      | title                | body                                  | userId |
      | Playlure smoke post  | Created by the BDD suite             | 1      |
      | Second outline row   | Another payload for coverage variety | 2      |
