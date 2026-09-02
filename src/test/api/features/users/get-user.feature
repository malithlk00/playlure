@api @users @smoke
Feature: Retrieve users

  @regression
  Scenario Outline: Getting a user by id returns matching profile data
    When I request the user with id <userId>
    Then the response status should be 200
    And the user response username should be "<username>"

    Examples:
      | userId | username  |
      | 1      | Bret      |
      | 2      | Antonette |

  @negative
  Scenario: Requesting a non-existent user returns 404
    When I request the user with id 9999
    Then the response status should be 404
