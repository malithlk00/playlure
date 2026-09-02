@performance @network-har
Feature: Network activity recording
  As a performance engineer
  I want full network activity captured to a HAR file
  So that I can inspect exact requests and responses outside the test run

  @smoke
  Scenario: Visiting the main page produces a non-empty HAR recording
    Given I record network activity to a HAR file
    When I stop recording and close the HAR file
    Then the HAR file should contain at least 1 request
    And the HAR file's slowest request should be under 10000 ms
