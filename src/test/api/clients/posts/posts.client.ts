import type { APIResponse } from "@playwright/test";
import { BaseClient } from "../base/base.client";

export interface PostPayload {
  title: string;
  body: string;
  userId: number;
}

export class PostsClient extends BaseClient {
  async getPost(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  async createPost(payload: PostPayload): Promise<APIResponse> {
    return this.request.post("/posts", { data: payload });
  }

  async updatePost(id: number, payload: PostPayload): Promise<APIResponse> {
    return this.request.put(`/posts/${id}`, { data: payload });
  }
}
