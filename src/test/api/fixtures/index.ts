import type { APIResponse } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";

import { PostsClient, type PostPayload } from "../clients/posts/posts.client";
import { UsersClient } from "../clients/users/users.client";

export interface ApiContext {
  response: APIResponse | null;
  lastPayload?: PostPayload;
}

type ApiFixtures = {
  postsClient: PostsClient;
  usersClient: UsersClient;
  // Steps run sequentially within one generated test, so a plain mutable
  // object is enough to pass the "current" response from When to Then.
  apiContext: ApiContext;
};

export const test = base.extend<ApiFixtures>({
  postsClient: async ({ request }, use) => {
    await use(new PostsClient(request));
  },
  usersClient: async ({ request }, use) => {
    await use(new UsersClient(request));
  },
  // eslint-disable-next-line no-empty-pattern -- standard Playwright fixture idiom for "no dependencies"
  apiContext: async ({}, use) => {
    await use({ response: null });
  },
});

export const { Given, When, Then } = createBdd(test);
