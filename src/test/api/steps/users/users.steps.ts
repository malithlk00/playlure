import { expect } from "@playwright/test";
import { When, Then } from "../../fixtures";

When("I request the user with id {int}", async ({ usersClient, apiContext }, id: number) => {
  apiContext.response = await usersClient.getUser(id);
});

Then("the user response username should be {string}", async ({ apiContext }, expected: string) => {
  const body = await apiContext.response!.json();
  expect(body.username).toBe(expected);
});
