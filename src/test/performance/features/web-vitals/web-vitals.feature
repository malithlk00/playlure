@performance @web-vitals
Feature: Core Web Vitals
  As a performance engineer
  I want LCP, CLS, and INP measured using Google's own web-vitals library
  So that ranking-relevant user-experience regressions are caught early

  @smoke
  Scenario: Main page Core Web Vitals are not rated poor
    Given I install the Core Web Vitals collector
    And I am on the Wikipedia main page
    When I wait for Core Web Vitals to settle
    Then LCP should not be rated poor
    And CLS should not be rated poor

  @regression
  Scenario: Interaction to Next Paint is measured after a real interaction
    Given I install the Core Web Vitals collector
    And I am on the Wikipedia main page
    When I search for "Software testing"
    And I wait for Core Web Vitals to settle
    Then INP should not be rated poor
