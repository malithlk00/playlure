import type { APIResponse } from "@playwright/test";
import { BaseClient } from "../base/base.client";

export class UsersClient extends BaseClient {
  async getUser(id: number): Promise<APIResponse> {
    return this.request.get(`/users/${id}`);
  }
}
