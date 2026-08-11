import type { User } from "@/entities/user/model";
import { httpClient } from "@/shared/api/http-client";
import type { LoginFormValues } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login(values: LoginFormValues) {
    return httpClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });
  },

  me() {
    return httpClient<User>("/auth/me");
  },

  listDemoUsers() {
    return httpClient<Array<User & { demoPassword: string }>>("/auth/demo-users");
  },
};
