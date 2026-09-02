import { expect } from "@playwright/test";
import { When, Then } from "../../fixtures";

When("I request the post with id {int}", async ({ postsClient, apiContext }, id: number) => {
  apiContext.response = await postsClient.getPost(id);
});

When(
  "I create a post with title {string}, body {string} and userId {int}",
  async ({ postsClient, apiContext }, title: string, body: string, userId: number) => {
    apiContext.lastPayload = { title, body, userId };
    apiContext.response = await postsClient.createPost(apiContext.lastPayload);
  }
);

When(
  "I update the post with id {int} to title {string} and body {string}",
  async ({ postsClient, apiContext }, id: number, title: string, body: string) => {
    apiContext.lastPayload = { title, body, userId: 1 };
    apiContext.response = await postsClient.updatePost(id, apiContext.lastPayload);
  }
);

Then("the response status should be {int}", async ({ apiContext }, status: number) => {
  expect(apiContext.response?.status()).toBe(status);
});

Then("the post title should be {string}", async ({ apiContext }, expected: string) => {
  const body = await apiContext.response!.json();
  expect(body.title).toBe(expected);
});

Then("the post response id should be {int}", async ({ apiContext }, expected: number) => {
  const body = await apiContext.response!.json();
  expect(body.id).toBe(expected);
});

Then(
  "the post response should belong to user {int}",
  async ({ apiContext }, expectedUserId: number) => {
    const body = await apiContext.response!.json();
    expect(body.userId).toBe(expectedUserId);
  }
);

Then("the created post should have id {int}", async ({ apiContext }, expectedId: number) => {
  const body = await apiContext.response!.json();
  expect(body.id).toBe(expectedId);
});

Then("the response should echo the submitted title and body", async ({ apiContext }) => {
  const body = await apiContext.response!.json();
  expect(body.title).toBe(apiContext.lastPayload?.title);
  expect(body.body).toBe(apiContext.lastPayload?.body);
});
